module.exports = (app) => {
  const posts = require("../controllers/posts.controller.js");
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware");
  const checkRolesMiddleware = require("../middleware/check_roles.middleware.js");

  // add new position
  router.post("/add", verifyToken, checkRolesMiddleware([1]), posts.createPost);
  // get recommended posts
  router.get(
    "/recommended",
    verifyToken,
    checkRolesMiddleware([1]),
    posts.getRecommendedPosts
  );
  // get all posts
  router.get("/all", verifyToken, checkRolesMiddleware([1]), posts.getAllPosts);
  //update post content
  router.put(
    "/:postId",
    verifyToken,
    checkRolesMiddleware([1]),
    posts.updatePost
  );
  router.delete(
    "/:postId",
    verifyToken,
    checkRolesMiddleware([1]),
    posts.deletePost
  );
  //get post details
  router.get("/:postId", verifyToken, posts.getPostById);
  app.use("/api/posts", router);
};
