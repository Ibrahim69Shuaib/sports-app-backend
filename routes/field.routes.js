module.exports = (app) => {
  const field = require("../controllers/field.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware.js");
  const checkRolesMiddleware = require("../middleware/check_roles.middleware.js");

  // add new field
  router.post(
    "/add",
    verifyToken,
    checkRolesMiddleware([2]),
    field.createField
  );
  // edit field information
  router.put(
    "/edit/:id",
    verifyToken,
    checkRolesMiddleware([2]),
    field.updateField
  );
  // delete field
  router.delete(
    "/delete/:id",
    verifyToken,
    checkRolesMiddleware([2]),
    field.deleteField
  );
  // put a field under maintenance with start and end date
  router.put(
    "/under-maintenance/:id",
    verifyToken,
    checkRolesMiddleware([2]),
    field.putFieldUnderMaintenance
  );
  // remove field from maintenance and make the start and end dates null
  router.put(
    "/remove-maintenance/:id",
    verifyToken,
    checkRolesMiddleware([2]),
    field.setFieldMaintenanceStatus
  );
  // get all fields
  router.get("/all", verifyToken, field.getAllFields);
  // get all fields for current club
  router.get(
    "/all-current",
    verifyToken,
    checkRolesMiddleware([2]),
    field.getCurrentClubFields
  );
  // get fields by club id
  router.get("/by-club", verifyToken, field.getFieldsByClub);
  // get fields by duration {minDuration, maxDuration} in request query
  router.get("/by-duration", verifyToken, field.getFieldsByDuration);
  // get fields by size {minSize , maxSize} in request query
  router.get("/by-size", verifyToken, field.getFieldsBySize);
  // get fields by type => takes {type} in request query
  router.get("/by-type", verifyToken, field.getFieldsByType);
  // get fields by sport takes {sportId} in request query
  router.get("/by-sport", verifyToken, field.getFieldsBySport);

  app.use("/api/field", router);
};
