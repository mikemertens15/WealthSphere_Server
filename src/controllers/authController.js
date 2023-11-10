const User = require("../models/user_model");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

// Takes in a name, email, and password, and returns a user object if the email is not already in use.
exports.register = async (req, res) => {
  try {
    // Check if the email is already in use, and if it is, return an error.
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(409)
        .json({ status: "error", error: "Email already in use" });
    }

    // Hash the password and create the user.
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      financialStats: {
        netWorth: 0,
        budget: {
          hasBudget: false,
          income: 0,
          expenses: {},
        },
      },
    });

    // Return user information for context and success.
    res.json({
      status: "success",
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", error: error.message });
  }
};

// Takes in an email and password, and returns a user object if the email and password are valid.
exports.login = async (req, res) => {
  // Check if the user exists, and if not, return an error.
  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user) {
    return res.status(400).json({ status: "error", error: "User not found" });
  }

  // Check if the password is valid, if it is, return the user information and success, and if not, return an error.
  const isPasswordValid = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if (isPasswordValid) {
    return res.json({
      status: "success",
      name: user.name,
      email: user.email,
    });
  } else {
    return res.status(401).json({
      status: "error",
      error: "Password Incorrect, Please try again.",
    });
  }
};
