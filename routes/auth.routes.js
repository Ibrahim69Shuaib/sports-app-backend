module.exports = (app) => {
  const auth = require("../controllers/auth.controller.js");
  var router = require("express").Router();

  // Register a new User
  router.post("/register", auth.register);

  // Verify user's email
  router.get("/verify/:token", auth.verifyEmail); //use verify token function to secure this route

  // Login in
  router.post("/login", auth.login);

  app.use("/api/auth", router);
};
