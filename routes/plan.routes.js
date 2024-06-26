module.exports = (app) => {
  const plan = require("../controllers/plan.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware");
  const checkRolesMiddleware = require("../middleware/check_roles.middleware.js");
  // Create new plan (by system admin)
  router.post("/add", verifyToken, checkRolesMiddleware([3]), plan.createPlan);
  // Create new plan (by system admin)
  router.delete(
    "/delete/:planId",
    verifyToken,
    checkRolesMiddleware([3]),
    plan.deletePlanById
  );
  // Create new plan (by system admin)
  router.put(
    "/update/:planId",
    verifyToken,
    checkRolesMiddleware([3]),
    plan.editPlanById
  );
  // Get all plans
  router.get("/all", plan.getPlans);
  // Get plan by id
  router.get("/by-id/:planId", plan.getPlanById);
  app.use("/api/plan", router);
};
