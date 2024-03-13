module.exports = (app) => {
  const follower = require("../controllers/follower.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware");
  const checkRolesMiddleware = require("../middleware/check_roles.middleware.js");

  // follow a player
  router.post(
    "/add",
    verifyToken,
    checkRolesMiddleware([2]),
    follower.followPlayer
  );
  // block a player
  router.post(
    "/block/:playerId",
    verifyToken,
    checkRolesMiddleware([2]),
    follower.blockPlayer
  );
  // block a player
  router.post(
    "/unblock/:playerId",
    verifyToken,
    checkRolesMiddleware([2]),
    follower.unBlockPlayer
  );
  // unfollow a player
  router.delete(
    "/unfollow/:playerId",
    verifyToken,
    checkRolesMiddleware([2]),
    follower.unfollowPlayer
  );
  // get all followers
  router.get(
    "/all-followers",
    verifyToken,
    checkRolesMiddleware([2]),
    follower.getFollowers
  );
  // get all followed players
  router.get(
    "/all-followed",
    verifyToken,
    checkRolesMiddleware([2]),
    follower.getFollowedPlayers
  );

  app.use("/api/follow", router);
};
