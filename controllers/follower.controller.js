const db = require("../models");
const Follower = db.follower;
const Player = db.player;

// Follow a player
const followPlayer = async (req, res) => {
  try {
    const { playerId } = req.body;
    const followerId = req.user.id; // Assuming user information is available in req.user

    // Check if the follow relationship already exists
    const existingFollower = await Follower.findOne({
      where: { playerId, followerId },
    });

    if (existingFollower) {
      return res.status(400).json({ message: "Already following this player" });
    }

    // Check if the player being followed has blocked the follower
    const blockedFollower = await Follower.findOne({
      where: { playerId: followerId, followerId: playerId, status: "blocked" },
    });

    if (blockedFollower) {
      return res.status(400).json({ message: "This player has blocked you" });
    }

    // Create the follow relationship
    await Follower.create({ playerId, followerId });

    res.status(201).json({ message: "Player followed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Unfollow a player
const unfollowPlayer = async (req, res) => {
  try {
    const { playerId } = req.params;
    const followerId = req.user.id; // Assuming user information is available in req.user

    // Check if the follow relationship exists
    const follower = await Follower.findOne({
      where: { playerId, followerId },
    });

    if (!follower) {
      return res.status(404).json({ message: "Not following this player" });
    }

    // Delete the follow relationship
    await follower.destroy();

    res.status(200).json({ message: "Player unfollowed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Block a player
const blockPlayer = async (req, res) => {
  try {
    const { playerId } = req.params;
    const followerId = req.user.id; // Assuming user information is available in req.user

    // Check if the follow relationship exists
    const follower = await Follower.findOne({
      where: { playerId, followerId },
    });

    if (!follower) {
      return res.status(404).json({ message: "Not following this player" });
    }

    // Block the player
    follower.status = "blocked";
    await follower.save();

    res.status(200).json({ message: "Player blocked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// unBlock a player
const unBlockPlayer = async (req, res) => {
  try {
    const { playerId } = req.params;
    const followerId = req.user.id; // Assuming user information is available in req.user

    // Check if the follow relationship exists
    const follower = await Follower.findOne({
      where: { playerId, followerId },
    });

    if (!follower) {
      return res.status(404).json({ message: "Not following this player" });
    }

    // Block the player
    follower.status = "active";
    await follower.save();

    res.status(200).json({ message: "Player blocked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all followed players
const getFollowedPlayers = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user information is available in req.user

    // Find all players that the user is following
    const followedPlayers = await Follower.findAll({
      where: { followerId: userId, status: "active" },
      include: [{ model: Player, as: "player" }],
    });

    res.status(200).json(followedPlayers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Get all followers
const getFollowers = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user information is available in req.user

    // Find all players that the user is following
    const followedPlayers = await Follower.findAll({
      where: { playerId: userId, status: "active" },
      include: [{ model: Player, as: "player" }],
    });

    res.status(200).json(followedPlayers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  followPlayer,
  unfollowPlayer,
  blockPlayer,
  getFollowedPlayers,
  getFollowers,
  unBlockPlayer,
};
