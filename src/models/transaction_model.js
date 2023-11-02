const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  amount: Number,
  category: String,
  date: Date,
  merchant_name: String,
  account: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
});

const model = mongoose.model("Transaction", TransactionSchema);
module.exports = model;
