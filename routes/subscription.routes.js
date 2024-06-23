module.exports = (app) => {
  const subscription = require("../controllers/subscription.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware");
  const checkRolesMiddleware = require("../middleware/check_roles.middleware.js");
  // Create new plan (by system admin)
  router.post(
    "/subscribe/:planId",
    verifyToken,
    checkRolesMiddleware([2]),
    subscription.subscribeToPlan
  );
  router.post(
    "/cancel",
    verifyToken,
    checkRolesMiddleware([2]),
    subscription.cancelSubscription
  );
  // Get my subscription and plan
  router.get(
    "/",
    verifyToken,
    checkRolesMiddleware([2]),
    subscription.getCurrentActiveSubscription
  );
  // Get my subscription and plan
  router.get(
    "/all",
    verifyToken,
    checkRolesMiddleware([2]),
    subscription.getAllSubscriptions
  );
  // Get my subscription and plan
  router.get(
    "/statistics",
    verifyToken,
    checkRolesMiddleware([3]),
    subscription.getSubscriptionStatistics
  );
  // check for active subscriptions (true / false)
  router.get(
    "/check",
    verifyToken,
    checkRolesMiddleware([2]),
    subscription.activeSubscription
  );
  // Get my subscription and plan
  router.get(
    "/admin-all",
    verifyToken,
    checkRolesMiddleware([3]),
    subscription.getAllSubscriptionsFoAdmin
  );
  app.use("/api/subscription", router);
};
