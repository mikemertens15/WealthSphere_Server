const { createLinkToken } = require("../controllers/plaidController");
const plaidClient = require("../services/plaidClient");
const httpMocks = require("node-mocks-http");

jest.mock("../services/plaidClient");

describe("createLinkToken", () => {
  it("should create a link token successfully", async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    const mockTokenResponse = {
      data: {
        link_token: "link-token",
        expiration: "2022-01-01T00:00:00Z",
      },
    };

    plaidClient.linkTokenCreate.mockResolvedValue(mockTokenResponse);

    await createLinkToken(req, res);

    expect(JSON.parse(res._getData())).toEqual(mockTokenResponse.data);
  });
});
