const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const bodyParser = require("body-parser");
const plaidClient = require("../services/plaidClient");

const User = require("../models/user_model");
const PlaidItem = require("../models/plaid_item_model");
const Account = require("../models/account_model");
const Transaction = require("../models/transaction_model");

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_CLIENT_NAME = process.env.PLAID_CLIENT_NAME;
const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI;
const PLAID_LANGUAGE = process.env.PLAID_LANGUAGE;
const PLAID_COUNTRY_CODES = process.env.PLAID_COUNTRY_CODES.split(",");
const PLAID_PRODUCTS = process.env.PLAID_PRODUCTS.split(",");

// exchange the public token for an access token and item ID, and return the user
const exchangeTokenAndRetrieveUser = async (publicToken, userEmail) => {
  const exchangeResponse = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });
  const user = await User.findOne({ email: userEmail });
  if (!user) throw new Error("User not found");
  return { user, ...exchangeResponse.data };
};

// create a new plaid item and add it to the user's plaid items
const createPlaidItem = async (user, itemId, accessToken) => {
  const plaidItem = new PlaidItem({ itemId, accessToken, user: user._id });
  await plaidItem.save();
  await user.plaidItems.push(plaidItem._id);
  await user.save();
  return plaidItem;
};

// create a new account for each account in the plaid item, and add it to the plaid item and user
const processAccounts = async (accounts, plaidItem, user) => {
  let totalBalanceToAdd = 0;
  for (const account of accounts) {
    const newAccount = new Account({
      accountId: account.account_id,
      accountType: account.subtype,
      accountName: account.name,
      balances: {
        available: account.balances.available,
        current: account.balances.current,
      },
      plaidItem: plaidItem._id,
      user: user._id,
    });
    await newAccount.save();
    plaidItem.accounts.push(newAccount._id);
    if (account.type === "depository" || account.type === "investment") {
      totalBalanceToAdd += account.balances.current;
    } else if (account.type === "credit" || account.type === "loan") {
      totalBalanceToAdd -= account.balances.current;
    }
  }
  return totalBalanceToAdd;
};

// process all transactions in the plaid item and add them to the plaid item and user
const processTransactions = async (accessToken, plaidItem, user) => {
  let cursor = null;
  let transactions = [];
  let hasMore = true;

  while (hasMore) {
    const syncResponse = await plaidClient.transactionsSync({
      access_token: accessToken,
      cursor: cursor,
    });
    transactions = transactions.concat(syncResponse.data.added);
    hasMore = syncResponse.data.has_more;
    cursor = syncResponse.data.next_cursor;
  }

  for (const addedTrans of transactions) {
    const newTrans = new Transaction({
      amount: addedTrans.amount,
      account: addedTrans.account_id,
      category: addedTrans.personal_finance_category.primary,
      date: addedTrans.date,
      merchant_name: addedTrans.merchant_name,
      name: addedTrans.name,
      user: user._id,
    });
    await newTrans.save();
    user.financialStats.transactions.push(newTrans._id);
  }

  await user.save();

  // Cursor will let plaid know where to start next time
  plaidItem.transactionCursor = cursor;
  await plaidItem.save();
};

// create a temporary link token for the user and send it back to the client
exports.createLinkToken = async (req, res) => {
  try {
    const tokenResponse = await plaidClient.linkTokenCreate({
      user: { client_user_id: PLAID_CLIENT_ID }, // should make this the ID of the mongodb object eventually (user._id.toString())
      client_name: PLAID_CLIENT_NAME,
      language: PLAID_LANGUAGE,
      products: PLAID_PRODUCTS,
      country_codes: PLAID_COUNTRY_CODES,
      redirect_uri: PLAID_REDIRECT_URI,
    });
    const linkToken = tokenResponse.data.link_token;
    res.json({ status: "Success", link_token: linkToken });
  } catch (err) {
    res.status(500).json({ status: "Error", error: err.message });
  }
};

// exchange public token for access token, and store it with the user and do initial plaid item processing
// TODO: encrypt the access token before storing it in the database
exports.exchangePublicToken = async (req, res) => {
  try {
    const { user, item_id, access_token } = await exchangeTokenAndRetrieveUser(
      req.body.public_token,
      req.body.userEmail
    );
    const plaidItem = await createPlaidItem(user, item_id, access_token);

    const accountsResponse = await plaidClient.accountsGet({
      access_token: access_token,
    });
    const totalBalanceToAdd = await processAccounts(
      accountsResponse.data.accounts,
      plaidItem,
      user
    );

    await processTransactions(access_token, plaidItem, user);
    user.financialStats.netWorth += totalBalanceToAdd;
    await user.save();

    res.status(200).json({ status: "Success" });
  } catch (err) {
    res.status(500).json({ status: "Error", error: err.message });
  }
};
