const User = require("../models/user_model");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(409)
        .json({ status: "error", error: "Email already in use" });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      financialStats: {
        netWorth: 0,
      },
    });
    res.json({
      status: "success",
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", error: error });
  }
};

exports.login = async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user) {
    return res.status(400).json({ status: "error", error: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if (isPasswordValid) {
    return res.json({
      status: "success",
      name: user.name,
      email: user.email,
      items: user.items,
    });
  } else {
    return res.json({
      status: "error",
      error: "Password Incorrect, Please try again.",
    });
  }
};
