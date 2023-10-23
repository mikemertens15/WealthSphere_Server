const plaidClient = require("../services/plaidClient");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const User = require("../models/user_model");
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
  const exchangeResponse = await plaidClient.itemPublicTokenExchange({
    public_token: req.body.public_token,
  });

  // save item to a specific user
  const itemId = exchangeResponse.data.item_id;
  const access_token = exchangeResponse.data.access_token;

  try {
    const user = await User.findOne({
      email: req.body.userEmail,
    });

    user.items.push(itemId);
    user.accounts.set(itemId, access_token);
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
