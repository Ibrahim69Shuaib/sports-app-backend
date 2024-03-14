const db = require("../models");
const Follower = db.follower;
const Player = db.player;

// Follow a player
const followPlayer = async (req, res) => {
  try {
    const { playerId } = req.body;
    const userId = req.user.id; // Assuming user information is available in req.user

    // Find the player_id associated with the userId
    const player = await Player.findOne({ where: { user_id: userId } });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const player_id = player.id;

    // Check if the follow relationship already exists
    const existingFollower = await Follower.findOne({
      where: { player_id: playerId, follower_id: player_id },
    });

    if (existingFollower) {
      return res.status(400).json({ message: "Already following this player" });
    }

    // Check if the player being followed has blocked the follower
    const blockedFollower = await Follower.findOne({
      where: { player_id: playerId, follower_id: player_id, status: "blocked" },
    });

    if (blockedFollower) {
      return res.status(400).json({ message: "This player has blocked you" });
    }

    // Create the follow relationship
    await Follower.create({ player_id: playerId, follower_id: player_id });

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
    const userId = req.user.id; // Assuming user information is available in req.user
    // Find the player_id associated with the userId
    const player = await Player.findOne({ where: { user_id: userId } });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const player_id = player.id;
    // Check if the follow relationship exists
    const follower = await Follower.findOne({
      where: { player_id: playerId, follower_id: player_id },
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
    const userId = req.user.id; // Assuming user information is available in req.user
    // Find the player_id associated with the userId
    const player = await Player.findOne({ where: { user_id: userId } });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const player_id = player.id;
    // Check if the follow relationship exists
    const follower = await Follower.findOne({
      where: { player_id: playerId, follower_id: player_id },
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
    const userId = req.user.id; // Assuming user information is available in req.user
    // Find the player_id associated with the userId
    const player = await Player.findOne({ where: { user_id: userId } });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const player_id = player.id;
    // Check if the follow relationship exists
    const follower = await Follower.findOne({
      where: { player_id: playerId, follower_id: player_id },
    });

    if (!follower) {
      return res.status(404).json({ message: "Not following this player" });
    }

    // Block the player
    follower.status = "active";
    await follower.save();

    res.status(200).json({ message: "Player unblocked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all followed players
const getFollowedPlayers = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user information is available in req.user
    const player = await Player.findOne({ where: { user_id: userId } });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const player_id = player.id;
    // Find all players that the user is following
    const followedPlayers = await Follower.findAll({
      where: { follower_id: player_id, status: "active" },
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
    // Find the player_id associated with the userId
    const player = await Player.findOne({ where: { user_id: userId } });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const player_id = player.id;
    // Find all players that the user is following
    const followedPlayers = await Follower.findAll({
      where: { player_id: player_id, status: "active" },
      include: [{ model: Player, as: "player" }],
    });

    res.status(200).json(followedPlayers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// get followers count for a player
const getFollowersCount = async (req, res) => {
  try {
    const { playerId } = req.params;

    const followersCount = await Follower.count({
      where: { player_id: playerId, status: "active" },
    });

    res.status(200).json({ followersCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// get my followed players count
const getFollowedPlayersCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const followedPlayersCount = await Follower.count({
      where: { follower_id: userId, status: "active" },
    });

    res.status(200).json({ followedPlayersCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//get blocked players
const getBlockedPlayers = async (req, res) => {
  try {
    const userId = req.user.id;

    const blockedPlayers = await Follower.findAll({
      where: { follower_id: userId, status: "blocked" },
      include: [{ model: Player, as: "player" }],
    });

    res.status(200).json(blockedPlayers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// get mutual followers
const getMutualFollowers = async (req, res) => {
  try {
    const { playerId } = req.params;
    const userId = req.user.id;
    const player = await Player.findOne({ where: { user_id: userId } });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const player_id = player.id;
    const userFollowers = await Follower.findAll({
      where: { player_id: playerId, status: "active" },
      attributes: ["follower_id"],
    });

    const mutualFollowers = await Follower.findAll({
      where: {
        follower_id: player_id, //replace with corresponding player_id
        status: "active",
        player_id: userFollowers.map((f) => f.follower_id),
      },
      include: [{ model: Player, as: "player" }],
    });

    res.status(200).json(mutualFollowers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//check follower status (blocked or active)
const checkFollowerStatus = async (req, res) => {
  try {
    const { playerId } = req.params;
    const userId = req.user.id;
    const player = await Player.findOne({ where: { user_id: userId } });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const player_id = player.id;
    const follower = await Follower.findOne({
      where: { player_id: playerId, follower_id: player_id },
    });

    if (!follower) {
      return res.status(404).json({ message: "Not following this player" });
    }

    res.status(200).json({ status: follower.status });
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
  getFollowersCount,
  getFollowedPlayersCount,
  getBlockedPlayers,
  getMutualFollowers,
  checkFollowerStatus,
};
