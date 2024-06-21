module.exports = (app) => {
  const tournament = require("../controllers/tournament.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware.js");
  const checkRolesMiddleware = require("../middleware/check_roles.middleware.js");
  const cacheMiddleware = require("../middleware/redis.middleware.js");
  // Create new tournament
  router.post(
    "/create",
    verifyToken,
    checkRolesMiddleware([2]),
    tournament.createTournament
  );
  // Join tournament
  router.post(
    "/join/:tournamentId",
    verifyToken,
    checkRolesMiddleware([1]),
    tournament.joinTournament
  );
  // set match winner
  router.post(
    "/matches/:matchId/winner",
    verifyToken,
    checkRolesMiddleware([2]),
    tournament.setMatchWinner
  );
  // update match schedule (date and durationId)
  router.post(
    "/matches/:matchId/schedule",
    verifyToken,
    checkRolesMiddleware([2]),
    tournament.updateMatchSchedule
  );
  // forfeit from tournament (by team captain)
  router.post(
    "/forfeit/:tournamentId",
    verifyToken,
    checkRolesMiddleware([1]),
    tournament.forfeitTournament
  );
  // cancel tournament
  router.post(
    "/cancel/:tournamentId",
    verifyToken,
    checkRolesMiddleware([2]),
    tournament.cancelTournament
  );
  // get tournament details
  router.get(
    "/by-id/:tournamentId",
    verifyToken,
    tournament.getTournamentDetails
  );
  // get team details (with tournaments participated)
  router.get("/teams/:teamId", verifyToken, tournament.getTeamDetails);
  // get match details
  router.get("/matches/:matchId", verifyToken, tournament.getMatchDetails);
  // get all tournaments
  router.get(
    "/all",
    verifyToken,
    // cacheMiddleware,
    tournament.getAllTournaments
  );
  // get all tournaments hosted by a club
  router.get(
    "/hosted/:clubId",
    verifyToken,
    tournament.getAllTournamentsHostedByClub
  );
  // get tournaments i participate in
  router.get(
    "/participated",
    verifyToken,
    tournament.getParticipatedTournaments
  );
  // is eliminated
  router.get(
    "/isEliminated/:tournamentId",
    verifyToken,
    checkRolesMiddleware([1]),
    tournament.isEliminated
  );
  // is eliminated
  router.get(
    "/belal-request/:tournamentId",
    verifyToken,
    tournament.getTournamentDetailsV2
  );

  app.use("/api/tournament", router);
};
