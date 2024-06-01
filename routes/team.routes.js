module.exports = (app) => {
  const team = require("../controllers/team.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware.js");
  const checkRolesMiddleware = require("../middleware/check_roles.middleware.js");

  // Create new Team
  router.post(
    "/create",
    verifyToken,
    checkRolesMiddleware([1]),
    team.createTeam
  );
  // leave team
  router.post("/leave", verifyToken, checkRolesMiddleware([1]), team.leaveTeam);
  // Edit team information by team captain
  router.put("/edit", verifyToken, checkRolesMiddleware([1]), team.updateTeam);
  // kick a player from the team by team captain
  router.put(
    "/kick/:playerId",
    verifyToken,
    checkRolesMiddleware([1]),
    team.kickPlayer
  );
  // give the Captain Role to Another Player in the Same Team
  router.put(
    "/transfer/:newCaptainId",
    verifyToken,
    checkRolesMiddleware([1]),
    team.transferCaptainRole
  );
  // get my team info
  router.get("/", verifyToken, checkRolesMiddleware([1]), team.getMyTeamInfo);
  // get team information by team id
  router.get("/by-team/:teamId", verifyToken, team.getTeamById);
  // get all teams
  router.get("/all", verifyToken, team.getAllTeams);
  // search for team by its name
  router.get("/search", verifyToken, team.searchTeamByName);
  // get team by user id
  router.get("/by-user/:userId", verifyToken, team.getTeamByUserId);
  // get team by player id
  router.get("/by-player/:playerId", verifyToken, team.getTeamByPlayerId);
  // get current team members
  router.get("/current-members", verifyToken, team.currentTeamMembers);
  // get team members by team id
  router.get("/team-members/:teamId", verifyToken, team.getTeamMembers);

  app.use("/api/team", router);
};
