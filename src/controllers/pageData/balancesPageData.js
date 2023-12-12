const User = require("../../models/user_model");
const Account = require("../../models/account_model");

// Get accounts with balances, and net worth
exports.getBalancePageData = async (req, res) => {
  const email = req.query.email;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ status: "error", error: "User not found" });
    }

    const netWorth = user.financialStats.netWorth;
    const accounts = await Account.find({ user: user._id });

    res.json({
      netWorth: netWorth,
      accounts: accounts,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "Error", error: err });
  }
};
