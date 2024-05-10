module.exports = (app) => {
  const search = require("../controllers/search.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware.js");

  // Search for Players ,Teams and Clubs by name
  router.get("/", verifyToken, search.GlobalSearch);

  app.use("/api/search", router);
};
