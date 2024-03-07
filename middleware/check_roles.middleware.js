const checkRolesMiddleware = (allowedRoles) => (req, res, next) => {
  try {
    if (!req.user || !allowedRoles.includes(req.user.role_id)) {
      return res
        .status(403)
        .json({ message: "Access forbidden for this role." });
    }

    next();
  } catch (error) {
    console.error("Error in checkRolesMiddleware:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports = checkRolesMiddleware;
