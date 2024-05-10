module.exports = (app) => {
  const utilities = require("../controllers/utilities.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware.js");
  const checkRolesMiddleware = require("../middleware/check_roles.middleware.js");

  // Add new utility by admin
  router.post(
    "/add",
    verifyToken,
    checkRolesMiddleware([3]),
    utilities.addUtility
  );
  // Update utility by admin
  router.put(
    "/update/:id",
    verifyToken,
    checkRolesMiddleware([3]),
    utilities.updateUtility
  );
  // Delete utility by admin
  router.delete(
    "/delete/:id",
    verifyToken,
    checkRolesMiddleware([3]),
    utilities.deleteUtility
  );
  // Get all utilities
  router.get("/all", verifyToken, utilities.getAllUtilities);
  // Get utility by id
  router.get("/:id", verifyToken, utilities.getUtilityById);
  // Add Utility To Club >>by club
  router.post(
    "/club-add",
    verifyToken,
    checkRolesMiddleware([2]),
    utilities.addUtilityToClub
  );
  // Remove Utility from Club >>by club
  router.delete(
    "/club-delete",
    verifyToken,
    checkRolesMiddleware([2]),
    utilities.removeUtilityFromClub
  );
  // Get Club Utilities By Club Id
  router.get("/club/:clubId", verifyToken, utilities.getClubUtilitiesByClubId);

  app.use("/api/utilities", router);
};
