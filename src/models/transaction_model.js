const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Account = require("./account_model");

const TransactionSchema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: "Account" },
});

module.exports = mongoose.model("TransactionSchema", TransactionSchema);
