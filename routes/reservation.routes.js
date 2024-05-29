module.exports = (app) => {
  const team_reservation = require("../controllers/team.reservation.controller.js");
  const player_reservation = require("../controllers/player.reservation.controller.js");
  const club_reservation = require("../controllers/club.reservation.controller.js");
  const reservation = require("../controllers/reservation.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware.js");
  const checkRolesMiddleware = require("../middleware/check_roles.middleware.js");
  // create team reservation
  router.post(
    "/team",
    verifyToken,
    checkRolesMiddleware([1]),
    team_reservation.createTeamReservation
  );
  // create player reservation
  router.post(
    "/player",
    verifyToken,
    checkRolesMiddleware([1]),
    player_reservation.createPlayerReservation
  );
  // create club reservation
  router.post(
    "/club",
    verifyToken,
    checkRolesMiddleware([2]),
    club_reservation.createClubReservation
  );
  // get all reservations
  router.get("/all", verifyToken, reservation.getAllReservations);
  // get all reservations with pagination
  router.get(
    "/all-pagination",
    verifyToken,
    reservation.getAllReservationsWithPagination
  );
  // get reservation by id
  router.get("/by-id/:id", verifyToken, reservation.getReservationById);
  // get reservations by club id
  router.get(
    "/by-user/:userId",
    verifyToken,
    reservation.getReservationsByUserId
  );
  // get reservations by date
  router.get(
    "/by-club/:clubId",
    verifyToken,
    reservation.getReservationsByClubId
  );
  // get reservations by field id
  router.get(
    "/by-field/:fieldId",
    verifyToken,
    reservation.getReservationsByFieldId
  );
  // get reservations by user id

  router.get("/date", verifyToken, reservation.getReservationsByDate);
  // refund reservation
  router.post(
    "/refund/:reservationId",
    verifyToken,
    checkRolesMiddleware([1]),
    reservation.processRefund
  );
  // cancel club type reservation
  router.post(
    "/cancel/:reservationId",
    verifyToken,
    checkRolesMiddleware([2]),
    club_reservation.cancelReservation
  );
  // check availability
  router.get(
    "/availability/:durationId",
    verifyToken,
    player_reservation.checkFieldAvailability
  );

  app.use("/api/reservation", router);
};
