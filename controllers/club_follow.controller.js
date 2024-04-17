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

module.exports = {
  followClub,
  unfollowClub,
  getPlayerFollowedClubs,
  getClubFollowers,
};
