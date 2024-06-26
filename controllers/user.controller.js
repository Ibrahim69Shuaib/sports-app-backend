const db = require("../models");
const User = db.user;
const bcrypt = require("bcryptjs");
const Sequelize = require("sequelize");
const Token = db.token;
// get all players even the soft deleted ones
const editUserDetails = async (req, res) => {
  const userId = req.user.id;

  try {
    const { username, email, phone_number } = req.body;

    if (userId !== parseInt(req.params.id)) {
      return res
        .status(403)
        .json({ message: "Forbidden: You cannot edit other users" });
    }

    await User.update(
      { username, email, phone_number },
      { where: { id: userId }, returning: true, plain: true }
    );

    res.status(200).json({ message: "User details updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating user details" });
  }
};
//same user
const changePassword = async (req, res) => {
  const userId = req.user.id; // Assuming the user ID is stored in the JWT payload
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify the old password
    const validPassword = await bcrypt.compare(oldPassword, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid old password" });
    }

    // Hash and update the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await User.update(
      { password: hashedNewPassword },
      { where: { id: userId } }
    );

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error changing password" });
  }
};
// same user or admin
const deleteUser = async (req, res) => {
  const userId = req.user.id;
  const isAdmin = req.user.role_id == 3;

  try {
    const userToDelete = await User.findByPk(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userId !== parseInt(req.params.id) && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Forbidden: You cannot delete other users" });
    }

    await userToDelete.destroy();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting user" });
  }
};
// add to auth middleware roles admin
const changeUserRole = async (req, res) => {
  try {
    const { role_id } = req.body;

    await User.update({ role_id }, { where: { id: req.params.id } });

    res.status(200).json({ message: "User role changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error changing user role" });
  }
};
const savePlayerId = async (req, res) => {
  try {
    const { playerId } = req.body;
    const userId = req.user.id;

    // Find or create a token entry for the user
    const [token, created] = await Token.findOrCreate({
      where: { user_id: userId },
      defaults: { user_id: userId },
    });

    // Update the notification_player_id
    await token.update({ notification_player_id: playerId });

    res.status(200).json({ message: "Player ID saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// add to auth middleware roles admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving users" });
  }
};

const getUserDetailsById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving user details" });
  }
};

const getUserDetailsByName = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving user details" });
  }
};
// add to auth middleware roles admin
const getNumberOfUsers = async (req, res) => {
  try {
    const userCount = await User.count();
    const clubCount = await User.count({ where: { role_id: 2 } });
    const playerCount = await User.count({ where: { role_id: 1 } });

    res.status(200).json({ userCount, clubCount, playerCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving number of users" });
  }
};
//access for admin
// list users with pagination  => it takes page and limit as query params
const listUsers = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const offset = (page - 1) * limit;

    const users = await User.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ["password"] },
    });

    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error listing users" });
  }
};
//access for any role
const getCurrentUserDetails = async (req, res) => {
  const userId = req.user.id; // Assuming the user ID is stored in the JWT payload

  try {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving user details" });
  }
};
// access for admin
const getUserStatistics = async (req, res) => {
  try {
    const data = await User.findAll({
      attributes: [
        [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "month"],
        [Sequelize.fn("COUNT", Sequelize.col("*")), "total"],
      ],
      group: [Sequelize.fn("MONTH", Sequelize.col("createdAt"))],
    });

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving user statistics" });
  }
};
module.exports = {
  editUserDetails,
  deleteUser,
  changeUserRole,
  getAllUsers,
  getUserDetailsById,
  getUserDetailsByName,
  getNumberOfUsers,
  getCurrentUserDetails,
  getUserStatistics,
  changePassword,
  listUsers,
  savePlayerId,
};
// might need get user role name
// might need get current user name only
