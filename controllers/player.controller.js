const { where } = require("sequelize");
const db = require("../models");
const Player = db.player;
const User = db.user;
const Sport = db.sport;
const Position = db.position;
const Team = db.team;
// name no more than 7 letters
const createPlayer = async (req, res) => {
  try {
    const { name, available, pic, location, city, sportId, positionId } =
      req.body;

    // Assuming user information is available in req.user
    const userId = req.user.id;

    // Check if a player already exists for the given user_id
    const existingPlayer = await Player.findOne({ where: { user_id: userId } });

    if (existingPlayer) {
      return res
        .status(400)
        .json({ message: "Player already exists for this user" });
    }

    // Create a new player
    const player = await Player.create({
      name,
      available,
      pic,
      location,
      city,
      user_id: userId,
      sport_id: sportId,
      position_id: positionId,
    });

    res.status(201).json(player);
  } catch (error) {
    if (
      error.name === "SequelizeValidationError" ||
      "SequelizeUniqueConstraintError"
    ) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getPlayerById = async (req, res) => {
  try {
    const playerId = req.params.id;
    const player = await Player.findByPk(playerId, {
      include: [Sport, Position],
    });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.status(200).json(player);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updatePlayer = async (req, res) => {
  try {
    const playerId = req.params.id;
    const { name, available, pic, location, city, sportId, positionId } =
      req.body;

    const player = await Player.findByPk(playerId);

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Update player details
    player.name = name;
    player.available = available;
    player.pic = pic;
    player.location = location;
    player.city = city;
    player.sport_id = sportId;
    player.position_id = positionId;

    await player.save();

    res.status(200).json(player);
  } catch (error) {
    if (
      error.name === "SequelizeValidationError" ||
      "SequelizeUniqueConstraintError"
    ) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllPlayers = async (req, res) => {
  try {
    const players = await Player.findAll({
      include: [Sport, Position],
    });

    res.status(200).json(players);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getPlayersBySport = async (req, res) => {
  try {
    const sportId = req.params.sportId;
    if (!sportId || isNaN(sportId)) {
      return res.status(400).json({ message: "Invalid sportId" });
    }
    const players = await Player.findAll({
      where: { sport_id: sportId },
      include: [Sport, Position],
    });

    res.status(200).json(players);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getPlayersByPosition = async (req, res) => {
  try {
    const positionId = req.params.positionId;
    if (!positionId || isNaN(positionId)) {
      return res.status(400).json({ message: "Invalid positionId" });
    }
    const players = await Player.findAll({
      where: { position_id: positionId },
      include: [Sport, Position],
    });

    res.status(200).json(players);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getCurrentPlayerDetails = async (req, res) => {
  try {
    // Assuming user information is available in req.user
    const userId = req.user.id;

    const player = await Player.findOne({
      where: { user_id: userId },
      include: [Sport, Position], // maybe add team and lineup
    });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.status(200).json(player);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const getAllPlayersWithPagination = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    const players = await Player.findAndCountAll({
      include: [Sport, Position],
      offset,
      limit: pageSize,
    });

    res.status(200).json({
      players: players.rows,
      totalCount: players.count,
      totalPages: Math.ceil(players.count / pageSize),
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// get player by username
const getPlayerByUsername = async (req, res) => {
  try {
    const username = req.params.username;

    const player = await Player.findOne({
      include: [Sport, Position],
      where: {
        "$user.username$": username,
      },
      include: [
        {
          model: User,
          attributes: ["username"],
        },
      ],
    });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.status(200).json(player);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// get player by user id

const getPlayerByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const player = await Player.findOne({
      where: { user_id: userId },
      include: [Sport, Position],
    });

    res.status(200).json(player);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const isTeamCaptain = async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch the player details
    const player = await Player.findOne({ where: { user_id: userId } });

    if (!player) {
      return res.status(404).json({ message: "Player not found." });
    }

    // Fetch the team details using the team_id from the player model
    const team = await Team.findByPk(player.team_id);

    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    // Check if the player is the team captain
    const isCaptain = team.captain_id === player.id;

    res.status(200).json({ isCaptain });
  } catch (error) {
    console.error("Error checking team captain status:", error);
    res
      .status(500)
      .json({ message: "Error checking team captain status", error });
  }
};

module.exports = {
  createPlayer,
  getAllPlayers,
  getCurrentPlayerDetails,
  getPlayersBySport,
  getPlayersByPosition,
  getPlayerById,
  updatePlayer,
  getAllPlayersWithPagination,
  getPlayerByUsername,
  getPlayerByUserId,
  isTeamCaptain,
};
