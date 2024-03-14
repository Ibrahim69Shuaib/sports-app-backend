module.exports = (app) => {
  const follower = require("../controllers/follower.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware");
  const checkRolesMiddleware = require("../middleware/check_roles.middleware.js");

  // follow a player
  router.post(
    "/add",
    verifyToken,
    checkRolesMiddleware([1]),
    follower.followPlayer
  );
  // block a player
  router.post(
    "/block/:playerId",
    verifyToken,
    checkRolesMiddleware([1]),
    follower.blockPlayer
  );
  // block a player
  router.post(
    "/unblock/:playerId",
    verifyToken,
    checkRolesMiddleware([1]),
    follower.unBlockPlayer
  );
  // unfollow a player
  router.delete(
    "/unfollow/:playerId",
    verifyToken,
    checkRolesMiddleware([1]),
    follower.unfollowPlayer
  );
  // get all followers
  router.get(
    "/all-followers",
    verifyToken,
    checkRolesMiddleware([1]),
    follower.getFollowers
  );
  // get all followed players
  router.get(
    "/all-followed",
    verifyToken,
    checkRolesMiddleware([1]),
    follower.getFollowedPlayers
  );
  // get followers count
  router.get(
    "/followers-count/:playerId",
    verifyToken,
    checkRolesMiddleware([1]),
    follower.getFollowersCount
  );
  // get followed players count
  router.get(
    "/followed-count",
    verifyToken,
    checkRolesMiddleware([1]),
    follower.getFollowedPlayersCount
  );
  // get blocked players
  router.get(
    "/blocked",
    verifyToken,
    checkRolesMiddleware([1]),
    follower.getBlockedPlayers
  );
  // get mutual followers
  router.get(
    "/mutuals/:playerId",
    verifyToken,
    checkRolesMiddleware([1]),
    follower.getMutualFollowers
  );
  // check follower status
  router.get(
    "/status/:playerId",
    verifyToken,
    checkRolesMiddleware([1]),
    follower.checkFollowerStatus
  );

  app.use("/api/follow", router);
};
