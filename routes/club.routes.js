module.exports = (app) => {
  const club = require("../controllers/club.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware.js");
  const checkRolesMiddleware = require("../middleware/check_roles.middleware.js");

  // Create new club
  router.post(
    "/create",
    verifyToken,
    checkRolesMiddleware([2]),
    club.createClub
  );
  // Update club information
  router.put(
    "/update",
    verifyToken,
    checkRolesMiddleware([2]),
    club.updateClub
  );
  // Get current club details
  router.get(
    "/",
    verifyToken,
    checkRolesMiddleware([2]),
    club.getClubForCurrentUser
  );
  // Get player by club id
  router.get("/by-id/:clubId", verifyToken, club.getClubById);
  // Get club by username
  router.get("/by-name/:clubName", verifyToken, club.getClubByName);
  // Get players by user name
  router.get("/by-username/:username", verifyToken, club.getClubByUsername);
  // Get all players
  router.get("/all", verifyToken, club.getAllClubs);
  // Get all player wit pagination
  router.get("/list", verifyToken, club.getAllClubsWithPagination);
  /////////////////////////////////////////////////////////////////
  // Create Refund Policy  <MUST>
  router.post(
    "/create-policy",
    verifyToken,
    checkRolesMiddleware([2]),
    club.createRefundPolicy
  );
  // Update Refund Policy
  router.put(
    "/update-policy/:clubId",
    verifyToken,
    checkRolesMiddleware([2]),
    club.updateRefundPolicy
  );
  // Delete Refund Policy
  router.delete(
    "/delete-policy/:clubId",
    verifyToken,
    checkRolesMiddleware([2]),
    club.deleteRefundPolicy
  );
  // Get Refund Policy by clubId
  router.get("/refund-policy/:clubId", verifyToken, club.getRefundPolicy);
  // Check Club Profile for current user if it exists
  router.get(
    "/check",
    verifyToken,
    checkRolesMiddleware([2]),
    club.isClubProfile
  );
  // get current club most booked field
  router.get("/top-field/:clubId", verifyToken, club.getMostBookedField);
  // get current club most booked time
  router.get("/top-time/:clubId", verifyToken, club.getMostBookedDuration);
  // get current club most booked day
  router.get("/top-day/:clubId", verifyToken, club.getMostBookedDay);
  // get current club reservations revenue for the current month
  router.get(
    "/reservations-revenue/:clubId",
    verifyToken,
    club.getCurrentMonthReservationsRevenue
  );
  // get current club tournaments revenue for this month
  router.get(
    "/tournaments-revenue/:clubId",
    verifyToken,
    club.getCurrentMonthTournamentsRevenue
  );
  // get current club total revenue for this month only
  router.get("/top-day/:clubId", verifyToken, club.getMostBookedDay);
  // get current club total revenue
  router.get("/top-day/:clubId", verifyToken, club.getMostBookedDay);

  app.use("/api/club", router);
};
