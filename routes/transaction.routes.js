module.exports = (app) => {
  const transaction = require("../controllers/transaction.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware.js");
  const checkRolesMiddleware = require("../middleware/check_roles.middleware.js");
  // Get All Transactions / with pagination
  router.get("/all", verifyToken, transaction.getAllTransactions);
  // Get Transactions with filtering
  router.get("/filter", verifyToken, transaction.getFilteredTransactions);
  // Get Transactions by user id
  router.get("/by-user/:userId", verifyToken, transaction.getUserTransactions);
  // Get Transactions by date range
  router.get("/range", verifyToken, transaction.getTransactionsByDateRange);
  // Get Transactions Summary
  router.get("/summary", verifyToken, transaction.getTransactionSummary);

  app.use("/api/transaction", router);
};
