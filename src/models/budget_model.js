const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema({
  month: { type: String, required: true },
  projectedIncome: Number,
  projectedExpenses: { type: Map, of: Number },
  currentIncome: Number,
  currentExpenses: { type: Map, of: Number },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const model = mongoose.model("Budget", BudgetSchema);
module.exports = model;
