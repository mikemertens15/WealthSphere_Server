const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  amount: Number,
  account: String,
  category: String,
  date: Date,
  merchant_name: String,
  plaidItem: { type: mongoose.Schema.Types.ObjectId, ref: "PlaidItem" },
});

const model = mongoose.model("Transaction", TransactionSchema);
module.exports = model;
