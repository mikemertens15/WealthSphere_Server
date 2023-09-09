const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    accounts: [
      {
        item_id: String,
        access_token: String,
      },
    ],
  },
  { collection: "user-data" }
);

const model = mongoose.model("UserSchema", UserSchema);

module.exports = model;
