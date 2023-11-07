const { createLinkToken } = require("../controllers/plaidController");
const plaidClient = require("../services/plaidClient");
const httpMocks = require("node-mocks-http");

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
