// Take financial data from items in a user's accounts, and process them to make different endpoints for front-end
// Transactions should an organized list of recent transactions using the sync method (need to set up a cursor in the db)
// Net worth takes all assets (checking, savings, investments, etc), subtracts all debts(cards, mortgage, cars, etc)
// Investments return either general investment balances or a more specific breakdown of a user's different investments
// Debts break down every debt account a user has, and displays relevant data (interest, pay off help, etc)
// Bills get recurring transactions and display them separately, and can be manually entered as well
// User created Goals and their progress towards them

exports.dashboardData = async (req, res) => {
  // for current dashboard, need net worth, recent transactions (~5-6), data for spending chart
};

exports.netWorth = async (req, res) => {
  // return a $ figure to front-end, maybe with detailed breakdown of accounts?
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
