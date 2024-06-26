const db = require("../models");
const ClubFollow = db.club_follow;
const Player = db.player;
const Club = db.club;

// Follow a club
const followClub = async (req, res) => {
  try {
    const { playerId, clubId } = req.body;

    // Check if the club is already followed by the player
    const existingFollow = await ClubFollow.findOne({
      where: { player_id: playerId, club_id: clubId },
    });

    if (existingFollow) {
      return res.status(400).json({ message: "Club already followed" });
    }
    // Check if the clubId doesn't exist
    const club = await Club.findByPk(clubId);
    if (!club) {
      return res.status(400).json({ message: "Club not found" });
    }
    // Check if the playerId doesn't exist
    const player = await Player.findByPk(playerId);
    if (!player) {
      return res.status(400).json({ message: "Player not found" });
    }
    // Create a new club follow entry
    await ClubFollow.create({ player_id: playerId, club_id: clubId });

    res.status(201).json({ message: "Club followed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Unfollow a club
const unfollowClub = async (req, res) => {
  try {
    const { playerId, clubId } = req.body;

    if (!clubId) {
      return res.status(404).json({ message: "Club id is required" });
    }
    if (!playerId) {
      return res.status(404).json({ message: "Player id is required" });
    }
    // Find and delete the club follow entry
    const follow = await ClubFollow.findOne({
      where: { player_id: playerId, club_id: clubId },
    });

    if (!follow) {
      return res.status(404).json({ message: "Club not followed" });
    }

    await follow.destroy();

    res.status(200).json({ message: "Club unfollowed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get player's followed clubs
const getPlayerFollowedClubs = async (req, res) => {
  try {
    const playerId = req.params.playerId;

    // Find player's followed clubs
    const followedClubs = await ClubFollow.findAll({
      where: { player_id: playerId },
      include: [{ model: Club, as: "club" }],
    });

    res.status(200).json(followedClubs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get club's followers
const getClubFollowers = async (req, res) => {
  try {
    const clubId = req.params.clubId;

    // Find players who follow the club
    const clubFollowers = await ClubFollow.findAll({
      where: { club_id: clubId },
      include: [{ model: Player, as: "player" }],
    });

    res.status(200).json(clubFollowers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// get followers count for a player
const getFollowersCount = async (req, res) => {
  try {
    const { clubId } = req.params;

    const followersCount = await ClubFollow.count({
      where: { club_id: clubId },
    });

    res.status(200).json({ followersCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// check if club is followed
async function checkClubFollowStatus(req, res) {
  const { clubId } = req.params;
  const userId = req.user.id;

  try {
    const player = await Player.findOne({ where: { user_id: userId } });
    const player_id = player.id;
    const follow = await ClubFollow.findOne({
      where: {
        player_id: player_id,
        club_id: clubId,
      },
    });

    if (follow) {
      res.status(200).json({ isFollowing: true });
    } else {
      res.status(200).json({ isFollowing: false });
    }
  } catch (error) {
    console.error("Error checking follow status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
module.exports = {
  followClub,
  unfollowClub,
  getPlayerFollowedClubs,
  getClubFollowers,
  getFollowersCount,
  checkClubFollowStatus,
};
