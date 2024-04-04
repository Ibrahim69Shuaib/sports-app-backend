const db = require("../models");
const Position = db.position;
const Sport = db.sport;

const createPosition = async (req, res) => {
  try {
    const { name, key } = req.body;

    const position = await Position.create({ name, key });

    res.status(201).json(position);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllPositions = async (req, res) => {
  try {
    const positions = await Position.findAll();

    res.status(200).json(positions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getPositionById = async (req, res) => {
  try {
    const positionId = req.params.id;
    const position = await Position.findByPk(positionId);

    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }

    res.status(200).json(position);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const editPosition = async (req, res) => {
  try {
    const positionId = req.params.id;
    const { name, key } = req.body;

    const position = await Position.findByPk(positionId);

    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }

    position.name = name;
    position.key = key;

    await position.save();

    res.status(200).json(position);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deletePosition = async (req, res) => {
  try {
    const positionId = req.params.id;
    const position = await Position.findByPk(positionId);

    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }

    await position.destroy();

    res.status(204).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getPositionByKey = async (req, res) => {
  try {
    const key = req.params.key;
    const position = await Position.findOne({ where: { key } });

    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }

    res.status(200).json(position);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getPositionByName = async (req, res) => {
  try {
    const name = req.params.name;
    const position = await Position.findOne({ where: { name } });

    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }

    res.status(200).json(position);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const assignPositionToSport = async (req, res) => {
  try {
    const { sportId, positionId } = req.body;

    const sport = await Sport.findByPk(sportId);
    const position = await Position.findByPk(positionId);

    if (!sport || !position) {
      return res.status(404).json({ message: "Sport or Position not found" });
    }

    // Check if the assignment already exists
    const existingAssignment = await sport.hasPosition(position);

    if (existingAssignment) {
      return res
        .status(400)
        .json({ message: "Position is already assigned to this sport" });
    }

    // Create the assignment
    await sport.addPosition(position);

    res
      .status(201)
      .json({ message: "Position assigned to sport successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const removePositionFromSport = async (req, res) => {
  try {
    const { sportId, positionId } = req.body;

    const sport = await Sport.findByPk(sportId);
    const position = await Position.findByPk(positionId);

    if (!sport || !position) {
      return res.status(404).json({ message: "Sport or Position not found" });
    }

    // Check if the assignment exists
    const existingAssignment = await sport.hasPosition(position);

    if (!existingAssignment) {
      return res
        .status(404)
        .json({ message: "Position is not assigned to this sport" });
    }

    // Remove the assignment
    await sport.removePosition(position);

    res
      .status(204)
      .json({ message: "Position removed from sport successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports = {
  createPosition,
  getPositionById,
  getAllPositions,
  editPosition,
  deletePosition,
  getPositionByKey,
  getPositionByName,
  assignPositionToSport,
  removePositionFromSport,
};
