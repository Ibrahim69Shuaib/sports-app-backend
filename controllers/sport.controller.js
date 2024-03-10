// get sport by name
// delete sport
// edit sport
const db = require("../models");

const Sport = db.sport;
// add new sport
const createSport = async (req, res) => {
  try {
    const { name } = req.body;

    const sport = await Sport.create({ name });

    res.status(201).json(sport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// get all sports
const getAllSports = async (req, res) => {
  try {
    const sports = await Sport.findAll();

    res.status(200).json(sports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// get sport by id
const getSportById = async (req, res) => {
  try {
    const sportId = req.params.id;
    const sport = await Sport.findByPk(sportId);

    if (!sport) {
      return res.status(404).json({ message: "Sport not found" });
    }

    res.status(200).json(sport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// get sport by name
const getSportByName = async (req, res) => {
  try {
    const sportName = req.params.name;
    const sport = await Sport.findOne({ where: { name: sportName } });

    if (!sport) {
      return res.status(404).json({ message: "Sport not found" });
    }

    res.status(200).json(sport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// delete sport
const deleteSport = async (req, res) => {
  try {
    const sportId = req.params.id;
    const sport = await Sport.findByPk(sportId);

    if (!sport) {
      return res.status(404).json({ message: "Sport not found" });
    }

    await sport.destroy();

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// edit sport
const editSport = async (req, res) => {
  try {
    const sportId = req.params.id;
    const { name } = req.body;

    const sport = await Sport.findByPk(sportId);

    if (!sport) {
      return res.status(404).json({ message: "Sport not found" });
    }

    sport.name = name;
    await sport.save();

    res.status(200).json(sport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createSport,
  getAllSports,
  getSportById,
  getSportByName,
  editSport,
  deleteSport,
};
