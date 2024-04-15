module.exports = (app) => {
  const wallet = require("../controllers/wallet.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware.js");
  // Get current logged in user wallet
  router.get("/balance", verifyToken, wallet.getLoggedInUserWallet);

  app.use("/api/wallet", router);
};
