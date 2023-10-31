const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  total: Number,
  account: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const model = mongoose.model("Transaction", TransactionSchema);
module.exports = model;
