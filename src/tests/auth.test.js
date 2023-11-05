const { register, login } = require("../controllers/authController");
const User = require("../models/user_model");
const bcrypt = require("bcryptjs");
const httpMocks = require("node-mocks-http");

jest.mock("../models/user_model");
jest.mock("bcryptjs");

describe("register", () => {
  it("should register a new user successfully", async () => {
    const req = httpMocks.createRequest({
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      },
    });
    const res = httpMocks.createResponse();

    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashedpassword123");
    User.create.mockResolvedValue({
      name: "Test User",
      email: "test@example.com",
    });

    await register(req, res);

    expect(JSON.parse(res._getData())).toEqual({
      status: "success",
      name: "Test User",
      email: "test@example.com",
    });
  });

  it("should return an error if the email is already in use", async () => {
    const req = httpMocks.createRequest({
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      },
    });
    const res = httpMocks.createResponse();

    User.findOne.mockResolvedValue({
      name: "Test User",
      email: "test@example.com",
    });

    await register(req, res);

    expect(JSON.parse(res._getData())).toEqual({
      status: "error",
      error: "Email already in use",
    });
  });

  it("should return an error if an error occurs during user creation", async () => {
    const req = httpMocks.createRequest({
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      },
    });
    const res = httpMocks.createResponse();

    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashedpassword123");
    User.create.mockRejectedValue(new Error("Test error"));

    await register(req, res);

    expect(JSON.parse(res._getData())).toEqual({
      status: "error",
      error: "Test error",
    });
  });
});

describe("login", () => {
  it("should log in a user successfully", async () => {
    const req = httpMocks.createRequest({
      body: {
        email: "test@example.com",
        password: "password123",
      },
    });
    const res = httpMocks.createResponse();

    User.findOne.mockResolvedValue({
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword123",
    });
    bcrypt.compare.mockResolvedValue(true);

    await login(req, res);

    expect(JSON.parse(res._getData())).toEqual({
      status: "success",
      name: "Test User",
      email: "test@example.com",
    });
  });

  it("should return an error if the user is not found", async () => {
    const req = httpMocks.createRequest({
      body: {
        email: "test@example.com",
        password: "password123",
      },
    });
    const res = httpMocks.createResponse();

    User.findOne.mockResolvedValue(null);

    await login(req, res);

    expect(JSON.parse(res._getData())).toEqual({
      status: "error",
      error: "User not found",
    });
  });

  it("should return an error if the password is incorrect", async () => {
    const req = httpMocks.createRequest({
      body: {
        email: "test@example.com",
        password: "password123",
      },
    });
    const res = httpMocks.createResponse();

    User.findOne.mockResolvedValue({
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword123",
    });
    bcrypt.compare.mockResolvedValue(false);

    await login(req, res);

    expect(JSON.parse(res._getData())).toEqual({
      status: "error",
      error: "Password Incorrect, Please try again.",
    });
  });
});
