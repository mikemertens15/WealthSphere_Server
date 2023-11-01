const express = require("express");
const router = express.Router();
const {
  createLinkToken,
  exchangePublicToken,
  getBalance,
  getTransactions,
} = require("./controllers/plaidController");
const { register, login } = require("./controllers/authController");
const { dashboardData } = require("./controllers/financialDataController");

// Auth Routes
router.post("/api/register", register);
router.post("/api/login", login);

// Plaid Routes
router.get("/api/create_link_token", createLinkToken);
router.post("/api/exchange_public_token", exchangePublicToken);
router.get("/api/balance", getBalance);
router.get("/api/transactions", getTransactions);

// Finance Data routes
router.get("/api/get_dashboard_data", dashboardData);

module.exports = router;
