const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const routeRoles = {
  //user routes
  "/api/user/change-role": [3],
  "/api/user/all": [3],
  "/api/user/number": [3],
  "/api/user/monthly-statistics": [3],
  "/api/user/list": [3],
  // other routes
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
