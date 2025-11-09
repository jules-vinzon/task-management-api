const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const UserKey = require("../models/UserKey");
const UserToken = require("../models/UserToken");
const { generateKeyPair, decryptRSA } = require("../helpers/cryptoUtils");

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);

exports.getKey = async (req, res, next) => {
  try {
    console.log("GET KEY REQUEST BODY", req.body);
    const keyData = await UserKey.findOne({ request_id: req.body.request_id });
    console.log("FETCHED KEY DATA", keyData);

    if (!keyData) {
      const { publicKey, privateKey } = await generateKeyPair();

      await UserKey.insertOne({
        request_id: req.body.request_id,
        public_key: publicKey,
        private_key: privateKey,
        updated_at: new Date(),
      });

      return res.status(200).json({
        success: true,
        request_id: req.body.request_id,
        public_key: publicKey,
      });
    } else {
      return res.status(200).json({
        success: true,
        request_id: req.body.request_id,
        public_key: keyData.public_key,
      });
    }
  } catch (error) {
    console.error("[GET KEY]: ERROR OCCURRED", error);
    res.status(500).json({ success: false, error: "Server error" });
    next(err);
  }
};

exports.register = async (req, res, next) => {
  console.log("CHECK REQUEST BODY", req.body);
  const keyData = await UserKey.findOne({ request_id: req.body.request_id });
  console.log("CHECK KEY DATA", keyData);

  if (!keyData) {
    return res.status(400).json({ success: false, message: "Invalid token" });
  }

  const privKey = keyData.private_key;
  console.log("CHECK PRIV KEY", privKey);
  const encryptedData = req.body.encdata;

  const decryptedData = decryptRSA(privKey, encryptedData);
  console.log("CHECK DECRYPTED DATA", decryptedData);
  const parsed = JSON.parse(decryptedData.decrypted);

  const { name, email, username, password } = parsed;

  try {
    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });

    if (existingEmail) {
      return res
        .status(400)
        .json({ success: false, error: "Email already exists" });
    }

    if (existingUsername) {
      return res
        .status(400)
        .json({ success: false, error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    console.log("CHECK REQUEST BODY", req.body);
    const keyData = await UserKey.findOne({ request_id: req.body.request_id });
    console.log("CHECK KEY DATA", keyData);

    if (!keyData) {
      return res.status(400).json({ success: false, message: "Invalid token" });
    }

    const privKey = keyData.private_key;
    console.log("CHECK PRIV KEY", privKey);
    const encryptedData = req.body.encdata;

    const decryptedData = decryptRSA(privKey, encryptedData);
    const parsed = JSON.parse(decryptedData.decrypted);

    const { emailOrUsername, password } = parsed;

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });
    console.log("CHECK USER", user);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid credentials" });
    }

    const payload = { id: user.id };
    console.log("CHECK PAYLOAD", payload);

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const userToken = new UserToken({
      user_id: user.id,
      token: token,
    });

    await userToken.save();

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

exports.refetch = async (req, res, next) => {
  try {
    console.log("REFETCH REQ HEADERS", req.headers);
    const userToken = await UserToken.findOne({
      token: req.headers.token,
    }).populate("user_id");
    console.log("[REFETCH AUTH]: CHECK DATA", userToken);

    const user = userToken?.user_id;
    console.log("[REFETCH AUTH]: CHECK USER DATA", user);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid credentials" });
    }

    res.json({
      success: true,
      token: req.headers.token,
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

exports.logout = async (req, res, next) => {
  try {
    const result = await UserToken.deleteOne({ token: req.body.token });
    console.log("[REFETCH AUTH]: CHECK DATA", result);

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
    next(err);
  }
};
