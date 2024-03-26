module.exports = (app) => {
  const duration = require("../controllers/duration.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware.js");
  const checkRolesMiddleware = require("../middleware/check_roles.middleware.js");
  // Add duration to field
  router.post(
    "/add",
    verifyToken,
    checkRolesMiddleware([2]),
    duration.createDuration
  );
  // Remove duration from field
  router.delete(
    "/delete/:id",
    verifyToken,
    checkRolesMiddleware([2]),
    duration.deleteDuration
  );
  // Edit duration
  router.put(
    "/edit/:id",
    verifyToken,
    checkRolesMiddleware([2]),
    duration.updateDuration
  );
  // Get all durations
  router.get("/all", verifyToken, duration.getAllDurations);
  // Get durations of a field
  router.get("/by-field/:fieldId", verifyToken, duration.getDurationsByFieldId);
  app.use("/api/duration", router);
};
