const express = require("express");
const router = express.Router();
const {
  registerValidator,
  loginValidator,
} = require("../validators/validators");
const { register, login, getKey, refetch, logout} = require("../controllers/authController");

router.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path}`);
  next();
});

router.post("/register", register);
router.post("/login", loginValidator, login);
router.post("/get-key", getKey);
router.get("/refetch", refetch);
router.post("/logout", logout);


module.exports = router;
