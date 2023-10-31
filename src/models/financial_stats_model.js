const mongoose = require("mongoose");

const financialStatsSchema = new mongoose.Schema({
  netWorth: Number,
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const model = mongoose.model("FinancialStats", financialStatsSchema);
module.exports = model;
