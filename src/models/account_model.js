const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./user_model");

const AccountSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("AccountScheme", AccountSchema);
