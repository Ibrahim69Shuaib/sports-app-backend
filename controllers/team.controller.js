//create team // handle already in team => done
//handle team max size when someone joins a team => done in response of the request
//leave team // handle if captain leaves a team => done
//promote team member to team captain => done
//edit team information (team captain) => done
//kick player (team captain) => done
// handle when all team members leave the team = > soft delete the team => done
// other functionalities require requests table
// request to join team => done
// captain sends invite request => done
//add sport_id to functions => done
// delete team and handle that team member will have their team id set to null => done
const { Op } = require("sequelize");
const db = require("../models");
const Team = db.team;
const Player = db.player;
const Sequelize = require("sequelize");

// Create a new team
const createTeam = async (req, res) => {
  try {
    const {
      name,
      pic,
      description,
      up_for_game,
      lineup,
      maxNumber,
      level,
      sport_id,
    } = req.body;
    const userId = req.user.id;

    // Find the player with the user ID
    const player = await Player.findOne({
      where: { user_id: userId },
    });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Check if the player is already in a team
    if (player.team_id) {
      return res.status(400).json({ message: "Player is already in a team" });
    }

    // Create the team
    const team = await Team.create({
      name,
      pic,
      description,
      up_for_game,
      max_number: maxNumber,
      level, //"Excellent", "Intermediate", "Good", "Beginner"
      captain_id: player.id, // Make the player's ID the captain ID
      lineup, // to be deleted
      sport_id,
    });

    // Update the player's team_id
    await player.update({ team_id: team.id });

    res.status(201).json({ message: "Team created successfully", team });
  } catch (error) {
    if (error instanceof Sequelize.UniqueConstraintError) {
      // Handle unique constraint violation for team name
      return res.status(400).json({
        message: "Team name already exists, please choose a different name",
      });
    }
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// leave team
//If the player leaving the team is the captain and there are no other players left in the team, the team is soft deleted using Team.destroy().
//If there are other players in the team, one of them is randomly selected as the new captain.
const leaveTeam = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the player
    const player = await Player.findOne({ where: { user_id: userId } });
    if (!player || !player.team_id) {
      return res.status(400).json({ message: "Player is not in a team" });
    }

    // Find the team
    const team = await Team.findByPk(player.team_id);
    if (!team) {
      return res.status(400).json({ message: "Team not found" });
    }

    // Check if the player is the captain of the team
    if (team.captain_id === player.id) {
      // Find other players in the team
      const otherPlayers = await Player.findAll({
        where: { team_id: player.team_id, user_id: { [Op.ne]: userId } },
      });

      // If there are no other players, delete the team
      if (otherPlayers.length === 0) {
        await Team.destroy({ where: { id: player.team_id } });
        // Remove the player from the team
        await player.update({ team_id: null });
        return res.status(200).json({ message: "Team deleted successfully" });
      } else {
        // Select a new captain from the remaining players
        const newCaptain =
          otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
        await team.update({ captain_id: newCaptain.id });
      }
    }

    // Remove the player from the team
    await player.update({ team_id: null });

    res.status(200).json({ message: "Player left the team successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update team information
const updateTeam = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      pic,
      description,
      maxNumber,
      sport_id,
      up_for_game,
      lineup,
      level,
    } = req.body;

    // Find the player
    const player = await Player.findOne({ where: { user_id: userId } });
    if (!player || !player.team_id) {
      return res.status(400).json({ message: "Player is not in a team" });
    }

    // Find the team
    const team = await Team.findByPk(player.team_id);
    if (!team) {
      return res.status(400).json({ message: "Team not found" });
    }

    // Check if the player is the captain of the team
    if (team.captain_id !== player.id) {
      return res
        .status(403)
        .json({ message: "Only the team captain can update team information" });
    }

    // Update the team information
    await Team.update(
      {
        name,
        pic,
        description,
        max_number: maxNumber,
        level,
        sport_id,
        up_for_game,
        lineup,
      },
      { where: { id: player.team_id } }
    );

    res.status(200).json({ message: "Team information updated successfully" });
  } catch (error) {
    if (error instanceof Sequelize.UniqueConstraintError) {
      // Handle unique constraint violation for team name
      return res.status(400).json({
        message: "Team name already exists, please choose a different name",
      });
    }
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Kick a player from the team
const kickPlayer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { playerId } = req.params;

    // Find the captain player
    const captain = await Player.findOne({ where: { user_id: userId } });
    if (!captain || !captain.team_id) {
      return res.status(400).json({ message: "Player is not in a team" });
    }

    // Find the team of the captain player
    const team = await Team.findByPk(captain.team_id);
    if (!team) {
      return res.status(400).json({ message: "Team not found" });
    }

    // Check if the player is the captain of the team
    if (team.captain_id !== captain.id) {
      return res
        .status(403)
        .json({ message: "Only the team captain can kick players" });
    }

    // Find the player to be kicked
    const playerToKick = await Player.findByPk(playerId);
    if (!playerToKick || playerToKick.team_id !== team.id) {
      return res.status(400).json({ message: "Player not found in the team" });
    }

    // Remove the player from the team
    await playerToKick.update({ team_id: null });

    res
      .status(200)
      .json({ message: "Player kicked from the team successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// get my team information
const getMyTeamInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the player
    const player = await Player.findOne({ where: { user_id: userId } });
    if (!player || !player.team_id) {
      return res.status(400).json({ message: "Player is not in a team" });
    }

    // Find the team
    const team = await Team.findByPk(player.team_id);
    if (!team) {
      return res.status(400).json({ message: "Team not found" });
    }

    res.status(200).json({ team });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// get team info by team id
const getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;

    // Find the team
    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(400).json({ message: "Team not found" });
    }

    res.status(200).json({ team });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// get all teams
const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.findAll();
    res.status(200).json({ teams });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// search for team by its name
const searchTeamByName = async (req, res) => {
  try {
    const { name } = req.query;

    // Search for teams by name
    const teams = await Team.findAll({
      where: Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("team.name")),
        {
          [Op.like]: `%${name.toLowerCase()}%`,
        }
      ),
    });

    res.status(200).json({ teams });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Get team information by user ID
const getTeamByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the player by user ID
    const player = await Player.findOne({ where: { user_id: userId } });
    if (!player || !player.team_id) {
      return res
        .status(404)
        .json({ message: "Player not found or not in a team" });
    }

    // Find the team by team ID
    const team = await Team.findByPk(player.team_id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Get team information by player ID
const getTeamByPlayerId = async (req, res) => {
  try {
    const playerId = req.params.playerId;

    // Find the player by player ID
    const player = await Player.findByPk(playerId);
    if (!player || !player.team_id) {
      return res
        .status(404)
        .json({ message: "Player not found or not in a team" });
    }

    // Find the team by team ID
    const team = await Team.findByPk(player.team_id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// give the Captain Role to Another Player in the Same Team
const transferCaptainRole = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newCaptainId } = req.params;

    // Find the current captain player
    const currentCaptain = await Player.findOne({ where: { user_id: userId } });
    if (!currentCaptain || !currentCaptain.team_id) {
      return res.status(400).json({ message: "Player is not in a team" });
    }

    // Find the team of the current captain player
    const team = await Team.findByPk(currentCaptain.team_id);
    if (!team) {
      return res.status(400).json({ message: "Team not found" });
    }

    // Check if the player is the captain of the team
    if (team.captain_id !== currentCaptain.id) {
      return res
        .status(403)
        .json({ message: "Only the team captain can transfer captain role" });
    }

    // Find the new captain player
    const newCaptain = await Player.findByPk(newCaptainId);
    if (!newCaptain || newCaptain.team_id !== team.id) {
      return res
        .status(400)
        .json({ message: "New captain not found in the team" });
    }

    // Update the team to set the new captain
    await team.update({ captain_id: newCaptain.id });

    res.status(200).json({ message: "Captain role transferred successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createTeam,
  leaveTeam,
  updateTeam,
  kickPlayer,
  getMyTeamInfo,
  getTeamById,
  getAllTeams,
  searchTeamByName,
  getTeamByUserId,
  getTeamByPlayerId,
  transferCaptainRole,
};
