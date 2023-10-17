// library imports
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user_model");
const {
  Configuration,
  PlaidApi,
  Products,
  PlaidEnvironments,
} = require("plaid");

// Environment Variables
const PORT = process.env.PORT || 3001;
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET_SAND;
const PLAID_ENV = "sandbox";
const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS || "transactions").split(
  ","
);
const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || "US").split(
  ","
);

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.DB_CONNECTION);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

/* Begin Authentication */
app.post("/api/register", async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(409)
        .json({ status: "error", error: "Email already in use" });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      items: [],
      accounts: {},
    });
    res.json({
      status: "success",
      name: user.name,
      email: user.email,
      items: user.items,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", error: error });
  }
});

app.post("/api/login", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user) {
    return res.status(400).json({ status: "error", error: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if (isPasswordValid) {
    return res.json({
      status: "success",
      name: user.name,
      email: user.email,
      items: user.items,
    });
  } else {
    return res.json({
      status: "error",
      error: "Password Incorrect, Please try again.",
    });
  }
});

/* End Authentication */

/* Begin Plaid API */

// Link stuff
const config = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": PLAID_CLIENT_ID,
      "PLAID-SECRET": PLAID_SECRET,
      "Plaid-Version": "2020-09-14",
    },
  },
});

const plaidClient = new PlaidApi(config);

// Create a link token
app.get("/api/create_link_token", async (req, res) => {
  const tokenResponse = await plaidClient.linkTokenCreate({
    user: { client_user_id: "user-id" }, // should make this the ID of the mongodb object eventually (user._id.toString())
    client_name: "WealthSphere",
    language: "en",
    products: PLAID_PRODUCTS,
    country_codes: PLAID_COUNTRY_CODES,
    redirect_uri: "http://localhost:3001/api",
  });
  res.json(tokenResponse.data);
});

// Exchange public token for an access token
app.post("/api/exchange_public_token", async (req, res) => {
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
});

/* End Link */

// Retrieve balances for an item
// Has basic functionality, needs to be updated to find a specific item from a user
app.get("/api/balance", async (req, res) => {
  const email = req.query.email;
  const itemId = req.query.itemId;

  const balanceResponse = await plaidClient.accountsBalanceGet({
    access_token: access_token,
  });

  res.json({
    Balance: balanceResponse.data,
  });
});

// Retrieve Transactions for an Item
app.get("/api/transactions", async (req, res) => {
  // find user in database and get access token from itemId
  const email = req.query.email;
  const itemId = req.query.itemId;

  try {
    const user = await User.findOne({
      email: email,
    });

    if (user.accounts.get(itemId)) {
      const response = await plaidClient.transactionsGet({
        access_token: user.accounts.get(itemId),
        start_date: "2018-01-01",
        end_date: "2018-02-01",
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
});

/* End Plaid API */

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
