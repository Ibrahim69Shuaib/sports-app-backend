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
  router.get(
    "/all",
    verifyToken,
    checkRolesMiddleware([3]),
    sport.getAllSports
  );
  // get sport by id
  router.get(
    "/by-id/:id",
    verifyToken,
    checkRolesMiddleware([3]),
    sport.getSportById
  );
  // get sport by name
  router.get(
    "/by-name/:name",
    verifyToken,
    checkRolesMiddleware([3]),
    sport.getSportByName
  );

  app.use("/api/sport", router);
};
