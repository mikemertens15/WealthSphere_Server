const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    plaidItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "PlaidItem" }],
    financialStats: {
      netWorth: Number,
      transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
      budget: {
        hasBudget: Boolean,
        income: Number,
        expenses: { type: Map, of: Number },
      },
    },
  },
  { collection: "user-data" }
);

const model = mongoose.model("User", UserSchema);

module.exports = model;
