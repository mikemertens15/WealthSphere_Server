const httpMocks = require("node-mocks-http");
const plaidController = require("../controllers/plaidController");
const exchangePublicToken = plaidController.exchangePublicToken;

jest.spyOn(plaidController, "exchangeTokenAndRetrieveUser").mockResolvedValue({
  user: { id: "123", financialStats: { netWorth: 100 } },
  item_id: "123",
  access_token: "access_token123",
});

jest
  .spyOn(plaidController, "createPlaidItem")
  .mockResolvedValue("plaidItem123");
jest.spyOn(plaidController, "processAccounts").mockResolvedValue(100);
jest.spyOn(plaidController, "processTransactions").mockResolvedValue();

describe("exchangePublicToken", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should exchange a public token and process financial data successfully", async () => {
    // Set up mock request and response objects
    const req = httpMocks.createRequest({
      body: {
        public_token: "public-token",
        userEmail: "user@example.com",
      },
    });
    const res = httpMocks.createResponse();

    // Call the function with the mocked request and response
    await exchangePublicToken(req, res);

    // Perform assertions
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ status: "Success" });
    expect(plaidController.exchangeTokenAndRetrieveUser).toHaveBeenCalledWith(
      "public-token",
      "user@example.com"
    );
    expect(plaidController.createPlaidItem).toHaveBeenCalledTimes(1);
    expect(plaidController.processAccounts).toHaveBeenCalledTimes(1);
    expect(plaidController.processTransactions).toHaveBeenCalledTimes(1);
  });
});
