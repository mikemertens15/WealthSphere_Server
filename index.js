// library imports
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrpyt = require("bcrpytjs");
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
