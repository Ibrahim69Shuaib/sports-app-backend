module.exports = (app) => {
  const club_rating = require("../controllers/club_rating.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware.js");
  const checkRolesMiddleware = require("../middleware/check_roles.middleware.js");

  // Rate a club
  router.post(
    "/rate",
    verifyToken,
    checkRolesMiddleware([1]),
    club_rating.addOrUpdateRating
  );

  // Get club rating
  router.get("/:club_id", verifyToken, club_rating.getAverageRating);

  // Get ratings of a player
  router.get(
    "/player-ratings/:player_id",
    verifyToken,
    club_rating.getRatingsByPlayer
  );
  // List top rated Clubs
  //   router.get("/top-rated", verifyToken, club_rating.listTopRatedClubs);

  app.use("/api/club_rating", router);
};
