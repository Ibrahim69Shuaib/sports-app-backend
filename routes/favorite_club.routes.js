module.exports = (app) => {
  const favorite_club = require("../controllers/favorite_club.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware.js");
  const checkRolesMiddleware = require("../middleware/check_roles.middleware.js");
  // Add club to favorites
  router.post(
    "/add",
    verifyToken,
    checkRolesMiddleware([1]),
    favorite_club.addToFavorites
  );
  // Remove club from favorites
  router.delete(
    "/remove",
    verifyToken,
    checkRolesMiddleware([1]),
    favorite_club.removeFromFavorites
  );
  // Get player favorite clubs
  router.get(
    "/player-favorite/:playerId",
    verifyToken,
    favorite_club.getPlayerFavoriteClubs
  );
  // Get club favored by players
  router.get(
    "/club-favored/:clubId",
    verifyToken,
    favorite_club.getClubFavoredByPlayers
  );
  app.use("/api/favorite-club", router);
};
