// library imports
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrpyt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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
const PLAID_PUBLIC_KEY = process.env.PLAID_PUBLIC_KEY;
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

/* Begin Authentication */
app.post("/api/register", async (req, res) => {
  try {
    const hashedPassword = await bcrpyt.hash(req.body.password, 10);
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    res.json({ status: "ok" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", error: error });
  }
});

app.post("api/login", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  });

  const isPasswordValid = await bcrpyt.compare(
    req.body.password,
    user.password
  );

  if (isPasswordValid) {
    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET
    );
    return res.json({ status: "ok", user: token });
  } else {
    return res.json({ status: "ok", user: false });
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
    user: { client_user_id: "user-id" },
    client_name: "WealthSphere",
    language: "en",
    products: PLAID_PRODUCTS,
    country_codes: PLAID_COUNTRY_CODES,
    redirect_uri: "http://localhost:3000/api",
  });
  res.json(tokenResponse.data);
});

// Exchange public token for an access token
app.post("/api/exchange_public_token", async (req, res) => {
  const exchangeResponse = await plaidClient.itemPublicTokenExchange({
    public_token: req.body.public_token,
  });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
