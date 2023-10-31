const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    plaidItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "PlaidItem" }],
    financialStats: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinancialStats",
    },
  },
  { collection: "user-data" }
);

const model = mongoose.model("User", UserSchema);

module.exports = model;
