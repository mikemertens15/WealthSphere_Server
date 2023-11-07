const {
  createLinkToken,
  exchangePublicToken,
  exchangeTokenAndRetrieveUser,
  createPlaidItem,
  processAccounts,
  processTransactions,
} = require("../controllers/plaidController");
const plaidClient = require("../services/plaidClient");
const httpMocks = require("node-mocks-http");
const User = require("../models/user_model");
const PlaidItem = require("../models/plaid_item_model");
const Account = require("../models/account_model");
const Transaction = require("../models/transaction_model");

jest.mock("../services/plaidClient", () => ({
  linkTokenCreate: jest.fn(),
}));
jest.mock("../services/plaidClient");
jest.mock("../models/user_model");
jest.mock("../models/plaid_item_model");
jest.mock("../models/account_model");
jest.mock("../models/transaction_model");

describe("createLinkToken", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a link token successfully", async () => {
    // Mock the request and response
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    // Mock the Plaid client to resolve with a fake token
    const fakeLinkToken = "link-token";
    plaidClient.linkTokenCreate.mockResolvedValue({
      data: { link_token: fakeLinkToken },
    });

    // Call the function with the mocked request and response
    await createLinkToken(req, res);

    // Check that the response is as expected
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      status: "Success",
      link_token: fakeLinkToken,
    });
    expect(plaidClient.linkTokenCreate).toHaveBeenCalledTimes(1);
  });

  it("should handle errors when creating a link token fails", async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    // Mock the Plaid client to reject with an error
    const errorMessage = "An error occurred";
    plaidClient.linkTokenCreate.mockRejectedValue(new Error(errorMessage));

    // Call the function with the mocked request and response
    await createLinkToken(req, res);

    // Check that the response is a 500 error as expected
    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({
      status: "Error",
      error: errorMessage,
    });
    expect(plaidClient.linkTokenCreate).toHaveBeenCalledTimes(1);
  });
});

describe("exchangePublicToken", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should exchange public token, retrieve user, process accounts, process transactions, and return success", async () => {
    // Set up your input parameters
    const req = httpMocks.createRequest({
      method: "POST",
      url: "/exchange_public_token",
      body: {
        public_token: "mock_public_token",
        userEmail: "user@example.com",
      },
    });
    const res = httpMocks.createResponse();

    // Mock the dependencies
    const mockUser = {
      _id: "user_id",
      financialStats: { netWorth: 0 },
      save: jest.fn(),
      plaidItems: [],
    };
    const mockPlaidItem = {
      _id: "plaidItem_id",
      save: jest.fn(),
      accounts: [],
      transactions: [],
    };
    const mockAccount = { _id: "account_id", save: jest.fn() };
    const mockTransaction = { _id: "transaction_id", save: jest.fn() };

    plaidClient.itemPublicTokenExchange.mockResolvedValue({
      data: {
        access_token: "mock_access_token",
        item_id: "mock_item_id",
      },
    });

    plaidClient.accountsGet.mockResolvedValue({
      data: {
        accounts: [
          /*...mocked account data...*/
        ],
      },
    });

    plaidClient.transactionsSync.mockResolvedValue({
      data: {
        added: [
          /*...mocked transaction data...*/
        ],
        has_more: false,
      },
    });

    User.findOne.mockResolvedValue(mockUser);
    PlaidItem.mockImplementation(() => mockPlaidItem);
    Account.mockImplementation(() => mockAccount);
    Transaction.mockImplementation(() => mockTransaction);

    // Call the function under test
    await exchangePublicToken(req, res);

    // Assertions to confirm behavior
    expect(User.findOne).toHaveBeenCalledWith({ email: "user@example.com" });
    expect(plaidClient.itemPublicTokenExchange).toHaveBeenCalledWith({
      public_token: "mock_public_token",
    });
    // ... additional assertions for other mock functions ...

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ status: "Success" });
  });

  // it("should handle errors when user is not found", async () => {
  //   // Setup...
  //   // Mocks...

  //   User.findOne.mockResolvedValue(null);

  //   // Call the function under test...
  //   await exchangePublicToken(req, res);

  //   // Assertions...
  //   expect(res.statusCode).toBe(500);
  //   expect(res._getJSONData()).toEqual({
  //     status: "Error",
  //     error: "User not found",
  //   });
  // });

  // Additional test cases for failure paths, such as:
  // - What happens when the token exchange fails?
  // - What if the account processing or transaction processing throws an error?
  // - How are network errors handled?
});
