module.exports = (app) => {
  const club_follow = require("../controllers/club_follow.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware.js");
  const checkRolesMiddleware = require("../middleware/check_roles.middleware.js");

  // Follow a club
  router.post(
    "/follow",
    verifyToken,
    checkRolesMiddleware([1]),
    club_follow.followClub
  );

  // Unfollow a club
  router.delete(
    "/unfollow",
    verifyToken,
    checkRolesMiddleware([1]),
    club_follow.unfollowClub
  );

  // Get player followed clubs
  router.get(
    "/player-followed/:playerId",
    verifyToken,
    club_follow.getPlayerFollowedClubs
  );

  // Get club followers
  router.get(
    "/club-followers/:clubId",
    verifyToken,
    club_follow.getClubFollowers
  );
  // Get club followers count
  router.get(
    "/followers-count/:clubId",
    verifyToken,
    club_follow.getFollowersCount
  );
  // check if team is followed
  router.get(
    "/isFollowed/:clubId",
    verifyToken,
    club_follow.checkClubFollowStatus
  );

  app.use("/api/club-follow", router);
};
