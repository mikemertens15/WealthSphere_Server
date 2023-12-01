const User = require("../models/user_model");
const PlaidItem = require("../models/plaid_item_model");
const Account = require("../models/account_model");
const Transaction = require("../models/transaction_model");

exports.deleteUserPlaidItems = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) throw new Error("User not found");

    for (const plaidItemId of user.plaidItems) {
      await Account.deleteMany({ plaidItem: plaidItemId });
      await PlaidItem.findByIdAndDelete(plaidItemId);
    }

    await Transaction.deleteMany({ user: user._id });

    user.plaidItems = [];

    user.financialStats = {
      netWorth: 0,
      transactions: [],
      monthlyBudget: [],
    };

    await user.save();
    res.status(200).json({ message: "Plaid items deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
