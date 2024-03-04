const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const routeRoles = {
  "/api/auth/verify/:token": [1, 2, 3], // Accessible for both Player (1) and Club (2) roles
  "/api/test/pussycat": [1], // Accessible for both Player (1) and Club (2) roles
  "/api/clubRoute": [2], // Accessible for only Club (2) role
  //more routes and their associated roles as needed
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from Bearer format

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user information to the request object

    const rolesRequired = routeRoles[req.path];

    if (rolesRequired && !rolesRequired.includes(req.user.role_id)) {
      return res
        .status(403)
        .json({ message: "Access forbidden for this role." });
    }

    next(); // Allow request to proceed
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = {
  verifyToken,
};
