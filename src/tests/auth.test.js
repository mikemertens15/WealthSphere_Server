const { register } = require("../controllers/authController");
const User = require("../models/user_model");
const bcrypt = require("bcryptjs");
const httpMocks = require("node-mocks-http");

jest.mock("../models/user_model");
jest.mock("bcryptjs");

describe("Register Function", () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    User.findOne.mockClear();
    User.create.mockClear();
    bcrypt.hash.mockClear();
  });

  test("registers a new user successfully", async () => {
    // Setup
    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashedPassword");
    User.create.mockResolvedValue({
      name: "Mike",
      email: "mike@example.com",
    });

    const mockReq = {
      body: {
        name: "Mike",
        email: "mike@example.com",
        password: "password123",
      },
    };
    const mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    // Execute
    await register(mockReq, mockRes);

    // Assert
    expect(User.findOne).toHaveBeenCalledWith({ email: "mike@example.com" });
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(User.create).toHaveBeenCalledWith({
      name: "Mike",
      email: "mike@example.com",
      password: "hashedPassword",
      financialStats: {
        netWorth: 0,
        budget: {
          hasBudget: false,
          income: 0,
          expenses: {},
        },
      },
    });
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "success",
      name: "Mike",
      email: "mike@example.com",
    });
  });

  // Add more tests here for other scenarios like email already in use, error handling, etc.
});
