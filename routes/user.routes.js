module.exports = (app) => {
  const user = require("../controllers/user.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware");

  // edit user details - access by any role
  router.patch("/edit/:id", verifyToken, user.editUserDetails);
  // delete user - access by any role and admin role handled in the controller
  router.delete("/:id", verifyToken, user.deleteUser);
  // change user role - access by admin
  router.post("/change-role/:id", verifyToken, user.changeUserRole);
  // get all users - access by admin
  router.get("/all", verifyToken, user.getAllUsers);
  // get user details by id  - access by any role
  router.get("/details-id/:id", verifyToken, user.getUserDetailsById);
  // get user details by name - access by any role
  router.get("/details-name/:username", verifyToken, user.getUserDetailsByName);
  // get the number of users (player - club - admin) - access by admin
  router.get("/number", verifyToken, user.getNumberOfUsers);
  // get current user details - access by any role
  router.get("/current-details", verifyToken, user.getCurrentUserDetails);
  // get user statistics by month - access by admin role
  router.get("/monthly-statistics", verifyToken, user.getUserStatistics);
  // change current user password - access by any role
  router.post("/change-password", verifyToken, user.changePassword);
  // access by admin role
  // list users with pagination  => it takes page and limit as query params
  router.get("/list", verifyToken, user.listUsers);

  app.use("/api/user", router);
};
