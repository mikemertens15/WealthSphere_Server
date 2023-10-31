const plaidClient = require("../services/plaidClient");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const User = require("../models/user_model");
const PlaidItem = require("../models/plaid_item_model");
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

    // TODO: Grab balances with getBalance and make an account object. Add that to plaidItem b4 saving
    // 1. call balance/get, get an array of accounts in response
    // 2. for each account in the provided array, pull the account id, account type, and balances and set a new Account() object and save it
    // 3. push new accounts into accounts array of plaidItem we just made
    // 4. Save plaidItem

    user.plaidItems.push(plaidItem._id);

    // TODO: Adjust financial stats of user with newly linked item
    // 1. when going through the forEach loop, keep track of the balance, and what kind of account it is
    // 2. using that variable, after accounts have been saved, add the balance to the networth financialStat

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

exports.getBalance = async (req, res) => {
  const email = req.query.email;
  const itemId = req.query.itemId;

  try {
    const user = await User.findOne({
      email: email,
    });

    if (user.accounts.get(itemId)) {
      const balanceResponse = await plaidClient.accountsBalanceGet({
        access_token: user.accounts.get(itemId),
      });
      const account = balanceResponse.data.accounts[0];
      res.json({
        account: account,
      });
    } else {
      console.log("access token undefined");
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getTransactions = async (req, res) => {
  const email = req.query.email;
  const itemId = req.query.itemId;

  try {
    const user = await User.findOne({
      email: email,
    });

    if (user.accounts.get(itemId)) {
      const response = await plaidClient.transactionsSync({
        access_token: user.accounts.get(itemId),
        count: 1,
      });
      res.json({
        transactions: response.data,
      });
    } else {
      console.log("access token undefined");
    }
  } catch (err) {
    console.log(err);
  }
};
