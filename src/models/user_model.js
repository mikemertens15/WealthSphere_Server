const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    items: [String],
    accounts: {
      type: Map,
      of: String,
    },
    financeStats: {},
  },
  { collection: "user-data" }
);

const model = mongoose.model("UserSchema", UserSchema);

module.exports = model;
