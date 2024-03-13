module.exports = (app) => {
  const sport = require("../controllers/sport.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware");
  const checkRolesMiddleware = require("../middleware/check_roles.middleware.js");

  // add new sport
  router.post(
    "/add",
    verifyToken,
    checkRolesMiddleware([3]),
    sport.createSport
  );
  // edit sport
  router.put(
    "/edit/:id",
    verifyToken,
    checkRolesMiddleware([3]),
    sport.editSport
  );
  // delete sport
  router.delete(
    "/delete/:id",
    verifyToken,
    checkRolesMiddleware([3]),
    sport.deleteSport
  );
  // get all sports
  router.get("/all", verifyToken, sport.getAllSports);
  // get sport by id
  router.get("/by-id/:id", verifyToken, sport.getSportById);
  // get sport by name
  router.get("/by-name/:name", verifyToken, sport.getSportByName);
  // get all sport + their positions
  router.get("/all-positions", verifyToken, sport.getSportsWithPositions);
  // get positions for a specific sport
  router.get("/positions/:sportId", verifyToken, sport.getPositionsForSport);

  app.use("/api/sport", router);
};
