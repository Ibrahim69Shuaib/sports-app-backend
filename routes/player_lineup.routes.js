module.exports = (app) => {
  const player_lineup = require("../controllers/player_lineup.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware.js");
  const checkRolesMiddleware = require("../middleware/check_roles.middleware.js");

  // add a player to the team lineup
  router.post(
    "/add",
    verifyToken,
    checkRolesMiddleware([1]),
    player_lineup.addPlayerToLineup
  );

  // update player lineup
  router.put(
    "/update/:player_lineupId",
    verifyToken,
    checkRolesMiddleware([1]),
    player_lineup.updatePlayerInLineup
  );
  // remove player from team lineup
  router.delete(
    "/remove/:player_lineupId",
    verifyToken,
    checkRolesMiddleware([1]),
    player_lineup.removePlayerFromLineup
  );

  // get team lineup by team id
  router.get("/:teamId", verifyToken, player_lineup.getTeamLineup);

  app.use("/api/lineup", router);
};
