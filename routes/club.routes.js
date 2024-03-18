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
  // Search for club
  router.get("/search", verifyToken, club.searchClub);

  app.use("/api/club", router);
};
