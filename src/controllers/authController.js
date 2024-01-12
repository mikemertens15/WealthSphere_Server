const User = require("../models/user_model");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

// Takes in a name, email, and password, and returns a user object if the email is not already in use.
exports.register = async (req, res, next) => {
  try {
    // Check if the email is already in use, and if it is, return an error.
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      const error = new Error("Email already in use");
      error.status = 409;
      throw error;
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
    next(error);
  }
};

// Takes in an email and password, and returns a user object if the email and password are valid.
exports.login = async (req, res, next) => {
  // Check if the user exists, and if not, return an error.
  try {
    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
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
      const error = new Error("Invalid password");
      error.status = 401;
      throw error;
    }
  } catch (error) {
    next(error);
  }
};
