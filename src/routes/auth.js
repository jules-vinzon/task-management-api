const express = require("express");
const router = express.Router();
const {
  registerValidator,
  loginValidator,
} = require("../validators/validators");
const { register, login } = require("../controllers/authController");

router.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path}`);
  next();
});

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);

module.exports = router;
