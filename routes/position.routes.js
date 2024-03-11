module.exports = (app) => {
  const position = require("../controllers/position.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware");
  const checkRolesMiddleware = require("../middleware/check_roles.middleware.js");

  // add new position
  router.post(
    "/add",
    verifyToken,
    checkRolesMiddleware([3]),
    position.createPosition
  );
  // edit position {key , name}
  router.put(
    "/edit/:id",
    verifyToken,
    checkRolesMiddleware([3]),
    position.editPosition
  );
  // delete position
  router.delete(
    "/delete/:id",
    verifyToken,
    checkRolesMiddleware([3]),
    position.deletePosition
  );
  // get all positions
  router.get("/all", verifyToken, position.getAllPositions);
  // get position by id
  router.get("/by-id/:id", verifyToken, position.getPositionById);
  // get position by name
  router.get("/by-name/:name", verifyToken, position.getPositionByName);
  // get position by key
  router.get("/by-key/:key", verifyToken, position.getPositionByKey);
  // assign position to sport
  router.post(
    "/assign",
    verifyToken,
    checkRolesMiddleware([3]),
    position.assignPositionToSport
  );
  // remove position from sport
  router.post(
    "/remove",
    verifyToken,
    checkRolesMiddleware([3]),
    position.removePositionFromSport
  );

  app.use("/api/position", router);
};
