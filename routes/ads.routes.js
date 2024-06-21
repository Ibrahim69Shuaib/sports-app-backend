module.exports = (app) => {
  const ads = require("../controllers/ads.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware");

  // get ads for the home screen
  router.get("/get", ads.getRandomAds);

  app.use("/api/ads", router);
};
