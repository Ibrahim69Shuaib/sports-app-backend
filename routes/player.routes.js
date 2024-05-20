module.exports = (app) => {
  const player = require("../controllers/player.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware.js");
  const checkRolesMiddleware = require("../middleware/check_roles.middleware.js");

  // Get current player details
  router.get(
    "/",
    verifyToken,
    checkRolesMiddleware([1]),
    player.getCurrentPlayerDetails
  );
  // Create new Player
  router.post(
    "/create",
    verifyToken,
    checkRolesMiddleware([1]),
    player.createPlayer
  );
  // Get player by player id
  router.get("/by-id/:id", verifyToken, player.getPlayerById);
  // Get player by username
  router.get("/by-username/:username", verifyToken, player.getPlayerByUsername);
  // Get players by user id
  router.get("/user/:userId", verifyToken, player.getPlayerByUserId);
  // Update player information
  router.put(
    "/update/:id",
    verifyToken,
    checkRolesMiddleware([1]),
    player.updatePlayer
  );
  // Get all players
  router.get("/all", verifyToken, player.getAllPlayers); // needs some roles but idk what
  // Get all player wit pagination
  router.get("/list", verifyToken, player.getAllPlayersWithPagination);
  // Get players by sport
  router.get("/sport/:sportId", verifyToken, player.getPlayersBySport);
  // Get players by position
  router.get("/position/:positionId", verifyToken, player.getPlayersByPosition);
  // get is Team Captain
  router.get("/isTeamCaptain", verifyToken, player.isTeamCaptain);

  app.use("/api/player", router);
};
