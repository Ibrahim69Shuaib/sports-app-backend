const db = require("../models");
const User = db.user;
const Token = db.token;
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const validator = require("validator");
const { sendVerificationEmail } = require("../services/node-mailer");

dotenv.config();

//Generating a random verification token
const generateVerificationToken = async () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        const token = buffer.toString("hex");
        console.log("Generated Verification Token:", token);
        resolve(token);
      }
    });
  });
};

// Register controller
const register = async (req, res) => {
  const { username, email, password, phone_number, role_id } = req.body;

  // Validate email on the server side
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  // Validate phone number format
  if (
    !validator.isMobilePhone(phone_number, "any", { strictMode: false }) ||
    !phone_number.startsWith("+963")
  ) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  try {
    //validate that no other user has the same username
    const existingUser = await User.findOne({ where: { username } });

    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }
    //validate that no other user has the same phone number
    const existingUserWithPhoneNumber = await User.findOne({
      where: { phone_number },
    });

    if (existingUserWithPhoneNumber) {
      return res.status(400).json({ error: "Phone number already taken" });
    }
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      phone_number,
      role_id,
    });

    // Create JWT token
    const token = jwt.sign(
      { id: newUser.id, role_id: newUser.role_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    //checking if the user role is player send him a verification email else don't send and set is verified to true
    if (role_id == 1) {
      const verificationToken = await generateVerificationToken();
      console.log(verificationToken); // not working no logging anything in console
      await Token.create({
        user_id: newUser.id,
        email_token: verificationToken,
      });
      await sendVerificationEmail(email, verificationToken);
    } else {
      // For users with roles other than player, set isVerified to true directly
      await User.update({ isVerified: true }, { where: { id: newUser.id } });
    }
    res.status(201).json({ message: "User created successfully", token });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json({ message: "Username or email is already taken" });
    }
    console.error(err);
    res.status(500).json({ message: "Error creating user" });
  }
};

// Add your verification route handler here
const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const tokenRecord = await Token.findOne({ where: { email_token: token } });

    if (!tokenRecord) {
      return res.status(400).json({ message: "Invalid verification token" });
    }

    const user = await User.findByPk(tokenRecord.user_id);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    await User.update({ isVerified: true }, { where: { id: user.id } });
    await Token.destroy({ where: { user_id: user.id } });

    res.status(200).json({ message: "Email verification successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error verifying email" });
  }
};

// Login Controller
const login = async (req, res) => {
  const { email, password } = req.body;
  // Validate email on the server side
  if (!validator.isEmail(email)) {
    return res.status(400).json("Invalid email address");
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create JWT token upon successful login
    const token = jwt.sign(
      { id: user.id, role_id: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({ message: "Logged in successfully", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error logging in" });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
};
