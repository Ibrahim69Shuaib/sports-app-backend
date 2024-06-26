const db = require("../models");
const TeamFollow = db.team_follow;
const Player = db.player;
const Club = db.club;
const Team = db.team;

// Follow a team
const followTeam = async (req, res) => {
  try {
    const { playerId, teamId } = req.body;

    // Check if the team is already followed by the player
    const existingFollow = await TeamFollow.findOne({
      where: { player_id: playerId, team_id: teamId },
    });

    if (existingFollow) {
      return res.status(400).json({ message: "Team already followed" });
    }
    // Check if the teamId doesn't exist
    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(400).json({ message: "Team not found" });
    }
    // Check if the playerId doesn't exist
    const player = await Player.findByPk(playerId);
    if (!player) {
      return res.status(400).json({ message: "Player not found" });
    }

    // Create a new team follow entry
    await TeamFollow.create({ player_id: playerId, team_id: teamId });

    res.status(201).json({ message: "Team followed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Unfollow a team
const unfollowTeam = async (req, res) => {
  try {
    const { playerId, teamId } = req.body;
    if (!teamId) {
      return res.status(404).json({ message: "Team id is required" });
    }
    if (!playerId) {
      return res.status(404).json({ message: "Player id is required" });
    }
    // Find and delete the club follow entry
    const follow = await TeamFollow.findOne({
      where: { player_id: playerId, team_id: teamId },
    });

    if (!follow) {
      return res.status(404).json({ message: "Team not followed" });
    }

    await follow.destroy();

    res.status(200).json({ message: "Team unfollowed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get player's followed teams
const getPlayerFollowedTeams = async (req, res) => {
  try {
    const playerId = req.params.playerId;

    // Find player's followed teams
    const followedTeams = await TeamFollow.findAll({
      where: { player_id: playerId },
      include: [{ model: Team, as: "team" }],
    });

    res.status(200).json(followedTeams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get club's followers
const getTeamFollowers = async (req, res) => {
  try {
    const teamId = req.params.teamId;

    // Find players who follow the club
    const teamFollowers = await TeamFollow.findAll({
      where: { team_id: teamId },
      include: [{ model: Player, as: "player" }],
    });

    res.status(200).json(teamFollowers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// get followers count for a player
const getFollowersCount = async (req, res) => {
  try {
    const { teamId } = req.params;

    const followersCount = await TeamFollow.count({
      where: { team_id: teamId },
    });

    res.status(200).json({ followersCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// check if team is followed
async function checkTeamFollowStatus(req, res) {
  const { teamId } = req.params;
  const userId = req.user.id;

  try {
    const player = await Player.findOne({ where: { user_id: userId } });
    const player_id = player.id;
    const follow = await TeamFollow.findOne({
      where: {
        player_id: player_id,
        team_id: teamId,
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
  followTeam,
  unfollowTeam,
  getPlayerFollowedTeams,
  getTeamFollowers,
  getFollowersCount,
  checkTeamFollowStatus,
};
