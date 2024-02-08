// Take financial data from items in a user's accounts, and process them to make different endpoints for front-end
// Transactions should an organized list of recent transactions using the sync method (need to set up a cursor in the db)
// Net worth takes all assets (checking, savings, investments, etc), subtracts all debts(cards, mortgage, cars, etc)
// Investments return either general investment balances or a more specific breakdown of a user's different investments
// Debts break down every debt account a user has, and displays relevant data (interest, pay off help, etc)
// Bills get recurring transactions and display them separately, and can be manually entered as well
// User created Goals and their progress towards them

const moment = require("moment");

const User = require("../models/user_model");
const Account = require("../models/account_model");
const Transaction = require("../models/transaction_model");
const Budget = require("../models/budget_model");

exports.addManualAccount = async (req, res, next) => {
  // Create an account for a user manually, without using plaid.

  try {
    if (
      !req.body.accountType ||
      !req.body.accountName ||
      !req.body.accountBalance
    ) {
      const error = new Error("Missing required fields");
      error.status = 400;
      throw error;
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    const newAccount = new Account({
      accountId: Math.random().toString(36).substring(2, 15),
      accountType: req.body.accountType,
      accountName: req.body.accountName,
      balances: {
        available: undefined,
        current: req.body.accountBalance,
      },
      plaidItem: undefined,
      user: user._id,
    });
    await newAccount.save();
    user.financialStats.netWorth += req.body.accountBalance;
    await user.save();

    res
      .status(200)
      .json({ status: "success", message: "New account added successfully" });
  } catch (err) {
    next(err);
  }
};
exports.addManualTransaction = async (req, res, next) => {
  // Route for a user to manually add a transaction with no plaid interface
  try {
    // Find user
    const user = await User.findOne({ email: req.body.email });

    // Reformat the date to 'YYYY-MM-DD' format
    const inputDate = moment(req.body.date);
    let formattedDate;

    if (inputDate.isValid()) {
      formattedDate = inputDate.format("MM-DD-YYYY");
    } else {
      formattedDate = moment().format("MM-DD-YYYY");
    }

    const newTrans = new Transaction({
      amount: req.body.amount,
      account: req.body.account,
      category: req.body.category,
      date: formattedDate,
      merchant_name: req.body.merchant_name,
      name: req.body.name,
      transaction_id: Math.random().toString(36).substring(2, 15),
      plaidItem: undefined,
      user: user._id,
    });

    await newTrans.save();
    user.financialStats.transactions.push(newTrans._id);
    await user.save();
    res
      .status(200)
      .json({ status: "success", message: "Transaction Successfully added" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.updateTransactions = async (req, res) => {
  // Keep a transactions collection attached to a user, use this to update it with recent transactions
};

exports.createBudget = async (req, res, next) => {
  // Create a budget from a user's income and known expenses, will need a lot of data from user (rent, food, debts, etc)
  // This data will be used to create the dashboard chart
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    const expectedIncome = req.body.expectedIncome;
    const expectedExpenses = req.body.expectedExpenses; // expect a map from front-end

    const newBudget = new Budget({
      month: new Date().getMonth(),
      projectedIncome: expectedIncome,
      projectedExpenses: expectedExpenses,
      currentIncome: 0,
      currentExpenses: 0,
      user: user._id,
    });

    user.financialStats.monthlyBudget.push(newBudget._id);
    user.save();

    res.status(200).json({
      status: "success",
      message: "Budget Successfully added to user",
    });
  } catch (err) {
    next(err);
  }
};

exports.getBudget = async (req, res) => {
  // Should return the basic planned income and expenses, but also process transactions in a way that shows where you are at in the particular budget month
  // Will only work for the current month initially; will need to keep track of every month to implement further
};

exports.updateBudget = async (req, res) => {};

exports.investmentsOverview = async (req, res) => {
  // Return an overall view of investment balances, without going into detail on positions
};

exports.investmentSpecific = async (req, res) => {
  // Provide more specific data on investments (positions, risk, expected return, etc)
};

exports.getAccounts = async (email) => {
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    const accounts = await Account.find({ user: user._id });
    if (!accounts) {
      const error = new Error("Accounts not found");
      error.status = 404;
      throw error;
    }

    return accounts;
  } catch (err) {
    return err;
  }
};

exports.getBills = async (req, res) => {
  // Some sort of system to organize recurring expenses, like rent, utilities, etc
};

exports.addNewBill = async (req, res, next) => {
  // Add a new bill to a user's account
  try {
    const user = await User.findOne({ email: req.body.email });
    const newBill = {
      name: req.body.name,
      amount: req.body.amount,
      dueDate: req.body.dueDate,
    };
    user.financialStats.bills.push(newBill);
    await user.save();
  } catch (err) {
    next(err);
  }
};

exports.getDebts = async (req, res) => {
  // Collect all debt that a user has and send to front-end
};

exports.getTransactions = async (req, res, next) => {
  // Return a list of all transactions for a user, with some sort of pagination
  // TODO: adjust aggregation to return amounts with the full cents: 5.4 -> 5.40
  const email = req.query.email;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

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
        $limit: 100,
      },
    ]);
    res.json({ status: "success", transactions: recentTransactions });
  } catch (err) {
    next(err);
  }
};
