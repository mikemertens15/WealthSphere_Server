const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  transaction_id: String,
  amount: Number,
  account: String,
  category: String,
  date: Date,
  merchant_name: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const model = mongoose.model("Transaction", TransactionSchema);
module.exports = model;
