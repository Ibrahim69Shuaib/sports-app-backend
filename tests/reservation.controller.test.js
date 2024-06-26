const {
  createPlayerReservation,
} = require("../controllers/player.reservation.controller");
const {
  checkFieldAvailability,
} = require("../controllers/player.reservation.controller");
const db = require("../models");
const { mockRequest, mockResponse } = require("jest-mock-req-res");
const { startOfDay, addDays } = require("date-fns");

jest.mock("../models");

describe("Reservations Controller", () => {
  describe("checkFieldAvailability", () => {
    it("should return field availability for the next 30 days", async () => {
      const req = mockRequest({
        params: { durationId: 60 },
        query: { days: 30 },
      });
      const res = mockResponse();

      db.reservation.findOne = jest.fn().mockResolvedValue(null);

      await checkFieldAvailability(req, res);

      const today = startOfDay(new Date());
      const expectedAvailability = Array.from({ length: 30 }, (_, i) => ({
        date: startOfDay(addDays(today, i)).toISOString().split("T")[0],
        isAvailable: true,
      }));

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedAvailability);
    });

    it("should handle errors", async () => {
      const req = mockRequest({
        params: { durationId: 60 },
        query: { days: 30 },
      });
      const res = mockResponse();

      db.reservation.findOne = jest
        .fn()
        .mockRejectedValue(new Error("Database Error"));

      await checkFieldAvailability(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to check field availability due to an internal error.",
      });
    });
  });

  describe("createPlayerReservation", () => {
    it("should create a player reservation successfully", async () => {
      const req = mockRequest({
        body: {
          durationId: 60,
          date: "2027-04-28",
        },
        user: {
          id: 38,
        },
      });
      const res = mockResponse();

      // Mock models
      const duration = {
        id: 60,
        field: {
          id: 1,
          price: 100,
          isUnderMaintenance: false,
          start_date: null,
          end_date: null,
          club_id: 1,
        },
      };
      db.duration.findByPk = jest.fn().mockResolvedValue(duration);
      db.field.findByPk = jest.fn().mockResolvedValue(duration.field);
      db.club.findByPk = jest.fn().mockResolvedValue({ user_id: 1 });
      db.wallet.findOne = jest.fn().mockImplementation(({ where }) => {
        if (where.user_id === 38) {
          return Promise.resolve({ balance: 200, save: jest.fn() });
        } else {
          return Promise.resolve({ frozenBalance: 0, save: jest.fn() });
        }
      });
      db.reservation.findOne = jest.fn().mockResolvedValue(null);
      db.reservation.create = jest.fn().mockResolvedValue({
        id: 4,
        user_id: 38,
        duration_id: 60,
        type: "player",
        status: "incomplete",
        date: "2027-04-28",
        createdAt: "2027-04-27T20:01:23.794Z",
      });
      db.transaction.create = jest.fn().mockResolvedValue({
        save: jest.fn(),
      });

      await createPlayerReservation(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 4,
        user_id: 38,
        duration_id: 60,
        type: "player",
        status: "incomplete",
        date: "2027-04-28",
        createdAt: expect.any(String), // You can be more specific if needed
      });
    });

    it("should handle errors during reservation creation", async () => {
      const req = mockRequest({
        body: {
          durationId: 60,
          date: "2027-04-28",
        },
        user: {
          id: 38,
        },
      });
      const res = mockResponse();

      db.duration.findByPk = jest
        .fn()
        .mockRejectedValue(new Error("Database Error"));

      await createPlayerReservation(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Database Error",
        error: "Failed to create reservation due to an internal error.",
      });
    });
  });
});
