module.exports = (app) => {
  const request = require("../controllers/request.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware");
  const checkRolesMiddleware = require("../middleware/check_roles.middleware.js");

  // request to join a team
  router.post(
    "/team/:teamId",
    verifyToken,
    checkRolesMiddleware([1]),
    request.sendJoinRequest
  );
  // Respond to a join request
  router.put(
    "/team/respond",
    verifyToken,
    checkRolesMiddleware([1]),
    request.respondToJoinRequest
  );
  // Send Team Invitation to a player
  router.post(
    "/team/invite/:playerId",
    verifyToken,
    checkRolesMiddleware([1]),
    request.sendTeamInvitation
  );
  // Send Team Invitation to a player
  router.put(
    "/team/invite/respond",
    verifyToken,
    checkRolesMiddleware([1]),
    request.respondToTeamInvitation
  );
  // get all sent requests for the logged in user (player)
  router.get("/sent", verifyToken, request.getAllSentRequests);
  // get all received requests for the logged in user (player)
  router.get("/received", verifyToken, request.getAllReceivedRequests);
  // get all sent received requests with filtering by "type" for the logged in user (player)
  router.get("/received/:type", verifyToken, request.filterRequestsByType); //type : ENUM[joinTeam,inviteToTeam,joinTournament,joinPost,enemyTeam]
  // Send Post Request to Post Owner
  router.post(
    "/post/:postId",
    verifyToken,
    checkRolesMiddleware([1]),
    request.createPostRequest
  );
  // Respond to POST Request and decline all other pending requests...
  router.put(
    "/post/respond/:requestId",
    verifyToken,
    checkRolesMiddleware([1]),
    request.respondToPostRequest
  );
  // router.get("/received/:postId", verifyToken, request.getRequestsByPost); //type : ENUM[joinTeam,inviteToTeam,joinTournament,joinPost,enemyTeam]

  app.use("/api/request", router);
};
