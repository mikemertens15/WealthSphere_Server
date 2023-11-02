const plaidClient = require("../services/plaidClient");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const User = require("../models/user_model");
const PlaidItem = require("../models/plaid_item_model");
const Account = require("../models/account_model");
const Transaction = require("../models/transaction_model");
const bodyParser = require("body-parser");

const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || "US").split(
  ","
);
const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS || "transactions").split(
  ","
);

exports.createLinkToken = async (req, res) => {
  const tokenResponse = await plaidClient.linkTokenCreate({
    user: { client_user_id: "user-id" }, // should make this the ID of the mongodb object eventually (user._id.toString())
    client_name: "WealthSphere",
    language: "en",
    products: PLAID_PRODUCTS,
    country_codes: PLAID_COUNTRY_CODES,
    redirect_uri: "http://localhost:3001/api",
  });
  res.json(tokenResponse.data);
};

exports.exchangePublicToken = async (req, res) => {
  try {
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: req.body.public_token,
    });

    // save item to a specific user
    const itemId = exchangeResponse.data.item_id;
    const accessToken = exchangeResponse.data.access_token;

    const user = await User.findOne({
      email: req.body.userEmail,
    });
    if (!user) {
      return res.status(404).json({ status: "error", error: "User not found" });
    }

    // Create new PlaidItem
    const plaidItem = new PlaidItem({
      itemId: itemId,
      accessToken: accessToken,
      user: user._id,
    });
    await plaidItem.save();

    let totalBalanceToAdd = 0;

    const accountGetResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    for (const account of accountGetResponse.data.accounts) {
      const newAccount = new Account({
        accountId: account.account_id,
        accountType: account.subtype,
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

    // Transactions
    // TODO: catch if the sync call gets the sync mutation error and correct

    let cursor = null;
    let added = [];
    let hasMore = true;

    while (hasMore) {
      const syncResponse = await plaidClient.transactionsSync({
        access_token: accessToken,
        cursor: cursor,
      });
      const data = syncResponse.data;
      added = added.concat(data.added);

      hasMore = data.has_more;
      cursor = data.next_cursor;
    }

    for (const addedTrans of added) {
      const newTrans = new Transaction({
        amount: addedTrans.amount,
        account: addedTrans.account_id,
        category: addedTrans.personal_finance_category.primary,
        date: addedTrans.date,
        merchant_name: addedTrans.merchant_name,
        name: addedTrans.name,
        plaidItem: plaidItem._id,
      });
      await newTrans.save();
      plaidItem.transactions.push(newTrans._id);
    }

    plaidItem.transactionCursor = cursor;

    await plaidItem.save();
    user.plaidItems.push(plaidItem._id);

    user.financialStats.netWorth += totalBalanceToAdd;

    await user.save();

    res.json({
      status: "Success",
      itemId: itemId,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "Error", error: err });
  }
};
