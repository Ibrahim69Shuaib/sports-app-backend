const db = require("../models");
const player_lineup = db.player_lineup;
const Player = db.player;
const Team = db.team;
const Position = db.position;

// find the player from the req = > find his team => check if team captain => validate all fields => check if existing player lineup
// checks for the body = > check if the player is in the same team as the captain making the request , check if the position id is valid , replcae isCaptain with dynamic
// add a player to the team lineup
const addPlayerToLineup = async (req, res) => {
  try {
    const userId = req.user.id;
    const { playerId, x, y, isBenched } = req.body;
    let isCaptain; // Declare isCaptain variable here

    // Find the player with the user ID
    const player = await Player.findOne({
      where: { user_id: userId },
    });
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    // Check if the requesting player is in a team and is the team captain
    const team = await Team.findByPk(player.team_id);
    if (!team) {
      return res.status(404).send({ message: "Team not found." });
    }
    if (team.captain_id !== player.id) {
      return res.status(403).send({
        message: "Only the team captain can add players to the lineup.",
      });
    }

    // Check if the playerId in the request body is the team captain
    const requestedPlayer = await Player.findByPk(playerId);
    if (!requestedPlayer) {
      return res.status(404).send({ message: "Requested player not found." });
    }
    if (requestedPlayer.team_id !== player.team_id) {
      return res.status(403).send({
        message: "Requested player is not in the same team as the captain.",
      });
    }

    // Determine if the requested player is the captain
    isCaptain = requestedPlayer.id === team.captain_id;

    // Validate required fields
    if (!player.team_id || !playerId || !x || !y) {
      return res.status(400).send({ message: "All fields are required." });
    }

    // Check if the player is already in the lineup
    const existingPlayerInLineup = await player_lineup.findOne({
      where: { team_id: player.team_id, player_id: playerId },
    });
    if (existingPlayerInLineup) {
      return res
        .status(400)
        .send({ message: "Player is already in the lineup." });
    }

    // Create player in lineup
    const playerInLineup = await player_lineup.create({
      team_id: player.team_id,
      player_id: playerId,
      x,
      y,
      isCaptain,
      isBenched,
    });

    res.send(playerInLineup);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error adding player to lineup", error: error.message });
  }
};
// update player lineup
const updatePlayerInLineup = async (req, res) => {
  try {
    const userId = req.user.id;
    const { player_lineupId } = req.params;
    const { x, y, isCaptain, isBenched } = req.body;

    // Find the player with the user ID
    const player = await Player.findOne({
      where: { user_id: userId },
    });
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    // Check if the requesting player is in a team and is the team captain
    const team = await Team.findByPk(player.team_id);
    if (!team) {
      return res.status(404).send({ message: "Team not found." });
    }
    if (team.captain_id !== player.id) {
      return res.status(403).send({
        message: "Only the team captain can update players in the lineup.",
      });
    }
    // Validate input
    if (!player_lineupId) {
      return res.status(400).send({ message: "Player lineup ID is required." });
    }
    // Find the player lineup entry
    const playerLineup = await player_lineup.findByPk(player_lineupId);
    if (!playerLineup) {
      return res.status(404).send({ message: "Player lineup not found." });
    }

    // Verify that the player lineup is associated with the same team as the team captain
    if (playerLineup.team_id !== player.team_id) {
      return res.status(403).send({
        message: "Player lineup is not associated with the captain's team.",
      });
    }
    // Update player in lineup
    await playerLineup.update({
      x,
      y,
      isCaptain,
      isBenched,
    });

    res.send(playerLineup);
  } catch (error) {
    res.status(500).send({
      message: "Error updating player in lineup",
      error: error.message,
    });
  }
};

const removePlayerFromLineup = async (req, res) => {
  try {
    const userId = req.user.id;
    const { player_lineupId } = req.params;

    // Validate input
    if (!player_lineupId) {
      return res.status(400).send({ message: "player_lineupId is required." });
    }
    // Find the player with the user ID
    const player = await Player.findOne({
      where: { user_id: userId },
    });
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    // Check if the requesting player is the team captain
    const playerInLineup = await player_lineup.findByPk(player_lineupId);
    if (!playerInLineup) {
      return res.status(404).send({ message: "Player in lineup not found." });
    }

    const team = await Team.findByPk(playerInLineup.team_id);
    if (!team) {
      return res.status(404).send({ message: "Team not found." });
    }

    if (team.captain_id !== player.id) {
      return res.status(403).send({
        message: "Only the team captain can remove players from the lineup.",
      });
    }

    // Find and delete player from lineup
    await player_lineup.destroy({
      where: { id: player_lineupId },
    });

    res.send({ message: "Player removed from lineup successfully." });
  } catch (error) {
    res.status(500).send({
      message: "Error removing player from lineup",
      error: error.message,
    });
  }
};

const getTeamLineup = async (req, res) => {
  try {
    const { teamId } = req.params;

    // Validate team ID
    if (!teamId) {
      return res.status(400).send({ message: "Team ID is required." });
    }

    // Get team lineup
    const lineup = await player_lineup.findAll({
      where: { team_id: teamId },
      include: [
        {
          model: Player,
          as: "player",
          attributes: ["name", "pic"],
          include: [{ model: Position }],
        },
      ],
    });

    res.send({ lineup });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error retrieving team lineup", error: error.message });
  }
};

module.exports = {
  addPlayerToLineup,
  updatePlayerInLineup,
  removePlayerFromLineup,
  getTeamLineup,
};
