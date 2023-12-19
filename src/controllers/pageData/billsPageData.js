const User = require("../../models/user_model");

exports.getBillsPageData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("bills");
    res.status(200).json({ bills: user.bills });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
