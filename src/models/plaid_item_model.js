const mongoose = require("mongoose");

const PlaidItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  accessToken: { type: String, required: true },
  accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
  transactionCursor: { type: String, default: "" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const model = mongoose.model("PlaidItem", PlaidItemSchema);

module.exports = model;
