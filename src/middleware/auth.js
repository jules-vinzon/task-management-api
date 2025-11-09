const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const token = req.header("Token");
  if (!token) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('CHECKKKK USER', req.user);

    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ error: "Invalid credentials" });
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Invalid credentials" });
  }
};
