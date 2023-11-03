// Take financial data from items in a user's accounts, and process them to make different endpoints for front-end
// Transactions should an organized list of recent transactions using the sync method (need to set up a cursor in the db)
// Net worth takes all assets (checking, savings, investments, etc), subtracts all debts(cards, mortgage, cars, etc)
// Investments return either general investment balances or a more specific breakdown of a user's different investments
// Debts break down every debt account a user has, and displays relevant data (interest, pay off help, etc)
// Bills get recurring transactions and display them separately, and can be manually entered as well
// User created Goals and their progress towards them

// When an account (item) gets linked, update stats
const User = require("../models/user_model");
const PlaidItem = require("../models/plaid_item_model");

exports.dashboardData = async (req, res) => {
  // for current dashboard, need net worth, recent transactions (~5-6), data for spending chart
  // TODO: test multiple accounts with net worth b4 moving to transactions
  // TODO: if no budget, direct user to budget page to create one
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
    const recentTransactions = await PlaidItem.aggregate([
      {
        $match: { user: user._id },
      },
      {
        $lookup: {
          from: "transactions",
          localField: "transactions",
          foreignField: "_id",
          as: "transactions",
        },
      },
      { $unwind: "$transactions" },
      {
        $lookup: {
          from: "accounts",
          localField: "transactions.account",
          foreignField: "accountId",
          as: "account",
        },
      },
      { $unwind: "$account" },
      {
        $project: {
          _id: "$transactions._id",
          amount: {
            $cond: {
              if: { $lt: ["$transactions.amount", 0] },
              then: { $multiply: ["$transactions.amount", -1] },
              else: "$transactions.amount",
            },
          },
          description: {
            $cond: {
              if: { $lt: ["$transactions.amount", 0] },
              then: "Refund",
              else: "Payment",
            },
          },
          accountName: "$account.accountName",
          category: "$transactions.category",
          date: "$transactions.date",
          merchant_name: "$transactions.merchant_name",
        },
      },
      {
        $sort: { date: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    res.json({
      budget: false,
      netWorth: netWorth,
      recentTransactions: recentTransactions,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "Error", error: err });
  }
};

exports.netWorth = async (req, res) => {
  // return a $ figure to front-end, maybe with detailed breakdown of accounts?
  // for item in user -> figure out if asset or debt, get a grand total and return
};

exports.updateTransactions = async (req, res) => {
  // Keep a transactions collection attached to a user, use this to update it with recent transactions
};

exports.createBudget = async (req, res) => {
  // Create a budget from a user's income and known expenses, will need a lot of data from user (rent, food, debts, etc)
  // This data will be used to create the dashboard chart
};

exports.investmentsOverview = async (req, res) => {
  // Return an overall view of investment balances, without going into detail on positions
};

exports.investmentSpecific = async (req, res) => {
  // Provide more specific data on investments (positions, risk, expected return, etc)
};

exports.getBills = async (req, res) => {
  // Some sort of system to organize recurring expenses, like rent, utilities, etc
};

exports.getDebts = async (req, res) => {
  // Collect all debt that a user has and send to front-end
};
