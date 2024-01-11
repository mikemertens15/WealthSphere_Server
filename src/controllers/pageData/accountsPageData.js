const getAccounts =
  require("../../controllers/financialDataController").getAccounts;

// Get accounts
exports.getAccountsPageData = async (req, res) => {
  try {
    const accounts = await getAccounts(req.query.email);
    res.json({
      accounts: accounts,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};
