const getAccounts =
  require("../../controllers/financialDataController").getAccounts;

// Get accounts
exports.getAccountsPageData = async (req, res, next) => {
  try {
    const accounts = await getAccounts(req.query.email);
    res.json({
      accounts: accounts,
    });
  } catch (err) {
    next(err);
  }
};
