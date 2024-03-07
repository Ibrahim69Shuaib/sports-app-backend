module.exports = (app) => {
  const permission = require("../controllers/permission.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware.js");
  const checkRolesMiddleware = require("../middleware/check_roles.middleware.js");
  // Get all permissions
  router.get(
    "/all",
    verifyToken,
    checkRolesMiddleware([3]),
    permission.getAllPermissions
  );
  // Get permission by id
  router.get(
    "/by-id/:id",
    verifyToken,
    checkRolesMiddleware([3]),
    permission.getPermissionById
  );
  // Get permission by name
  router.get(
    "/by-name/:name",
    verifyToken,
    checkRolesMiddleware([3]),
    permission.getPermissionByName
  );
  // Add new permission
  router.post(
    "/add",
    verifyToken,
    checkRolesMiddleware([3]),
    permission.addPermission
  );
  // Edit permission
  router.post(
    "/edit/:id",
    verifyToken,
    checkRolesMiddleware([3]),
    permission.editPermission
  );
  // Delete permission by id
  router.delete(
    "/:id",
    verifyToken,
    checkRolesMiddleware([3]),
    permission.deletePermissionById
  );

  app.use("/api/permission", router);
};
