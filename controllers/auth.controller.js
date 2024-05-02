const db = require("../models");
const User = db.user;
const Token = db.token;
const Wallet = db.wallet;
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const validator = require("validator");
const {
  sendVerificationEmail,
  sendVerificationCode,
} = require("../services/node-mailer");

dotenv.config();
// Generate Verification Code
const generateVerificationCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};
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
const createUserWallet = async (userId, roleId) => {
  try {
    // Create a wallet for the user
    const wallet = await Wallet.create({ user_id: userId });

    // If the user has a club role, set the frozen balance
    if (roleId == 2) {
      await wallet.update({ frozenBalance: 0.0 });
    }

    return wallet;
  } catch (error) {
    throw new Error(
      `Error creating wallet for user ${userId}: ${error.message}`
    );
  }
};
// Register controller
const register = async (req, res) => {
  const { username, email, password, phone_number, role_id } = req.body;

  // Validate email on the server side
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  // Validate phone number format
  if (
    !validator.isMobilePhone(phone_number, "any", { strictMode: false }) ||
    !phone_number.startsWith("+963")
  ) {
    return res.status(400).json({ message: "Invalid phone number format" });
  }

  try {
    //validate that no other user has the same username
    const existingUser = await User.findOne({ where: { username } });

    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }
    //validate that no other user has the same username
    const existingEmail = await User.findOne({ where: { email } });

    if (existingEmail) {
      return res.status(400).json({ message: "Email already taken" });
    }
    //validate that no other user has the same phone number
    const existingUserWithPhoneNumber = await User.findOne({
      where: { phone_number },
    });

    if (existingUserWithPhoneNumber) {
      return res.status(400).json({ message: "Phone number already taken" });
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
    // Call createUserWallet to create a wallet for the user
    await createUserWallet(newUser.id, newUser.role_id);
    res.status(201).json({ message: "User created successfully", token });
  } catch (err) {
    if (
      err.name === "SequelizeUniqueConstraintError" ||
      "SequelizeValidationError"
    ) {
      return res.status(400).json({ message: err.errors[0].message });
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
    // Check if the user is verified
    if (!user.isVerified) {
      return res.status(401).json({ message: "Email not verified" });
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
// send reset password email and save it to the db
const sendResetPasswordCode = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a verification code
    const verificationCode = generateVerificationCode();

    // Check if the user already has a record in the token table
    let tokenRecord = await Token.findOne({ where: { user_id: user.id } });

    if (tokenRecord) {
      // If the record exists, update it with the new password token
      await tokenRecord.update({ password_token: verificationCode });
    } else {
      // If the record doesn't exist, create a new one
      tokenRecord = await Token.create({
        user_id: user.id,
        password_token: verificationCode,
      });
    }

    // Send the verification code to the user's email
    await sendVerificationCode(email, verificationCode);

    res.status(200).json({ message: "Verification code sent successfully" });
  } catch (error) {
    console.error("Error sending reset password code:", error);
    res.status(500).json({ message: "Error sending verification code" });
  }
};

const verifyResetPasswordCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the token record for the user
    const token = await Token.findOne({ where: { user_id: user.id } });

    if (!token || token.password_token !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    res.status(200).json({ message: "Verification code is valid" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error verifying verification code" });
  }
};
const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await User.update({ password: hashedPassword }, { where: { id: user.id } });

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error resetting password" });
  }
};
module.exports = {
  register,
  login,
  verifyEmail,
  sendResetPasswordCode,
  verifyResetPasswordCode,
  resetPassword,
};
