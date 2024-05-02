module.exports = (app) => {
  const auth = require("../controllers/auth.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware");

  // Register a new User
  router.post("/register", auth.register);

  // Verify user's email
  router.get("/verify/:token", auth.verifyEmail); //use verify token function to secure this route

  // Login in
  router.post("/login", auth.login);
  router.post("/reset-password/send-code", auth.sendResetPasswordCode);
  router.post("/reset-password/verify-code", auth.verifyResetPasswordCode);
  router.post("/reset-password", auth.resetPassword);

  app.use("/api/auth", router);
};
