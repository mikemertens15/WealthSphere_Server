const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const config = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV_SAND],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET_SAND,
      "Plaid-Version": "2020-09-14",
    },
  },
});

const plaidClient = new PlaidApi(config);
module.exports = plaidClient;
