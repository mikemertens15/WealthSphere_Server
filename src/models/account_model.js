const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema({
  accountId: { type: String, required: true },
  accountType: String,
  balances: {
    available: Number,
    current: Number,
  },
  plaidItem: { type: mongoose.Schema.Types.ObjectId, ref: "PlaidItem" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const model = mongoose.model("Account", AccountSchema);
module.exports = model;
