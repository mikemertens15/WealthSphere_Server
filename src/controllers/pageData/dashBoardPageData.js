const User = require("../../models/user_model");
const Transaction = require("../../models/transaction_model");

exports.getDashboardData = async (req, res) => {
  // for current dashboard, need net worth, recent transactions (~5-6), data for spending chart
  // TODO: test multiple accounts
  const email = req.query.email;
  try {
    const user = await User.findOne({
      email: email,
    });

    if (!user) {
      return res.status(404).json({ status: "error", error: "User not found" });
    }

    const netWorth = user.financialStats.netWorth;

    // TODO: If merchant name is null, pass in some default value

    // Rewrite to account for new schema
    const recentTransactions = await Transaction.aggregate([
      {
        $match: {
          user: user._id,
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);

    res.json({
      netWorth: netWorth,
      recentTransactions: recentTransactions,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "Error", error: err });
  }
};
