module.exports = (app) => {
  const role = require("../controllers/role.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware.js");
  const checkRolesMiddleware = require("../middleware/check_roles.middleware.js");

  // Get all roles
  router.get("/all", verifyToken, checkRolesMiddleware([3]), role.getAllRoles);
  // Get all roles
  router.get(
    "/by-id/:id",
    verifyToken,
    checkRolesMiddleware([3]),
    role.getRoleById
  );
  // Get all roles
  router.get(
    "/by-name/:name",
    verifyToken,
    checkRolesMiddleware([3]),
    role.getRoleByName
  );
  // Get all roles
  router.get(
    "/roles-permissions",
    verifyToken,
    checkRolesMiddleware([3]),
    role.getRolesWithPermissions
  );
  // Get all roles
  router.post(
    "/assign",
    verifyToken,
    checkRolesMiddleware([3]),
    role.assignPermissionsToRole
  );

  app.use("/api/role", router);
};
