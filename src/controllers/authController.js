const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);

exports.register = async (req, res, next) => {
  console.log("Register endpoint hit");
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, username, password } = req.body;

  try {
    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });

    if (existingEmail) {
      return res.status(400).json({ success: false, error: "Email already exists" });
    }

    if (existingUsername) {
      return res.status(400).json({ success: false, error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });

    await user.save();

    const payload = { id: user.id };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { emailOrUsername, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      return res.status(400).json({ success: false, error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Invalid credentials" });
    }

    const payload = { id: user.id };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
    next(err);
  }
};
