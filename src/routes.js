const express = require("express");
const router = express.Router();
const {
  createLinkToken,
  exchangePublicToken,
} = require("./controllers/plaidController");
const { register, login } = require("./controllers/authController");
const {
  dashboardData,
  createBudget,
} = require("./controllers/financialDataController");
const { deleteUserPlaidItems } = require("./god/deleteUserPlaidItems");

// Auth Routes
router.post("/api/register", register);
router.post("/api/login", login);

// Plaid Routes
router.get("/api/create_link_token", createLinkToken);
router.post("/api/exchange_public_token", exchangePublicToken);

// Finance Data routes
router.get("/api/get_dashboard_data", dashboardData);
router.post("/api/create_budget", createBudget);

// God Mode
router.delete("/api/delete_plaid_items", deleteUserPlaidItems);

module.exports = router;
