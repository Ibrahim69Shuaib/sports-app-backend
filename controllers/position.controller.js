const db = require("../models");

const Position = db.position;

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
module.exports = { createPosition, getPositionById, getAllPositions };
//delete position
//edit position
//get position by name / key
