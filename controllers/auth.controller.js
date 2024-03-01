const db = require("../models");
const User = db.user;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const validator = require("validator");

dotenv.config();
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
};
