module.exports = (app) => {
  const auth = require("../controllers/auth.controller.js");

  var router = require("express").Router();

  // Register a new User
  router.post("/register", auth.register);

  // Login in
  router.post("/login", auth.login);

  app.use("/api/auth", router);
};
