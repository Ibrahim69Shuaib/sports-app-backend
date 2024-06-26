const { getRandomAds } = require("../controllers/ads.controller");
const db = require("../models");
const Field = db.field;
const Club = db.club;
const { mockRequest, mockResponse } = require("jest-mock-req-res");

jest.mock("../models");

describe("getRandomAds", () => {
  it("should return random ads", async () => {
    // Mock data
    Field.findAll.mockResolvedValue([{ id: 1, pic: "club1.jpg" }]);
    Club.findAll.mockResolvedValue([{ id: 1, pic: "field1.jpg" }]);

    const req = mockRequest();
    const res = mockResponse();

    await getRandomAds(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { id: 1, pic: "club1.jpg", type: "club" },
      { id: 1, pic: "field1.jpg", type: "field" },
    ]);
  });

  it("should handle errors", async () => {
    Field.findAll.mockRejectedValue(new Error("Database Error"));

    const req = mockRequest();
    const res = mockResponse();

    await getRandomAds(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Failed to fetch ads" });
  });
});
