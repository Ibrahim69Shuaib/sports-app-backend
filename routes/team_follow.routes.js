module.exports = (app) => {
  const team_follow = require("../controllers/team_follow.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware.js");
  const checkRolesMiddleware = require("../middleware/check_roles.middleware.js");

  // Follow a team
  router.post(
    "/follow",
    verifyToken,
    checkRolesMiddleware([1]),
    team_follow.followTeam
  );

  // Unfollow a team
  router.delete(
    "/unfollow",
    verifyToken,
    checkRolesMiddleware([1]),
    team_follow.unfollowTeam
  );

  // Get player followed teams
  router.get(
    "/followed/:playerId",
    verifyToken,
    team_follow.getPlayerFollowedTeams
  );

  // Get team followers
  router.get("/followers/:teamId", verifyToken, team_follow.getTeamFollowers);
  // Get team followers count
  router.get(
    "/followers-count/:teamId",
    verifyToken,
    team_follow.getFollowersCount
  );
  // check if team is followed
  router.get(
    "/isFollowed/:teamId",
    verifyToken,
    team_follow.checkTeamFollowStatus
  );

  app.use("/api/team-follow", router);
};
