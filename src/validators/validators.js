const { body } = require("express-validator");

exports.registerValidator = [
  body("name").isLength({ min: 2 }).withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
];

exports.loginValidator = [
  body("emailOrUsername")
    .trim()
    .notEmpty()
    .withMessage("Email or username is required"),
  body("password").exists().withMessage("Password is required"),
];

exports.taskValidator = [
  body("title").isLength({ min: 1 }).withMessage("Title is required"),
  body("status")
    .optional()
    .isIn(["Pending", "Ongoing", "Completed"])
    .withMessage("Invalid status"),
];
