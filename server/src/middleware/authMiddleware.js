// Auth middlewares
// - protect: must be logged in
// - optionalAuth: logged in OR guest (both ok)

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Require a valid JWT cookie
const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Please login first" });
    }

    // Check token signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (without password)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Try to read user if cookie exists, but do NOT fail if missing
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // Bad cookie → treat as guest
    req.user = null;
    next();
  }
};

module.exports = { protect, optionalAuth };
