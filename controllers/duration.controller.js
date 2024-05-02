const db = require("../models");
const moment = require("moment");
const Duration = db.duration;
const Field = db.field;
const Club = db.club;
//TODO: add time validation to be between the club working hours
// Create a new duration for a field
const createDuration = async (req, res) => {
  try {
    const userId = req.user.id;
    const { field_id, time } = req.body;

    // Find the field
    const field = await Field.findByPk(field_id);
    if (!field) {
      return res.status(404).json({ message: "Field not found" });
    }
    // Find the club of the user making the request
    const club = await Club.findOne({ where: { user_id: userId } });
    if (!club) {
      return res.status(400).json({ message: "You must be a club" });
    }
    // checking if the duration he is adding belongs to field that he owns
    if (field.club_id !== club.id) {
      return res
        .status(400)
        .json({ message: "You can only add durations to your own field" });
    }
    // Ensure time is in HH:mm format
    const formattedTime = moment(time, "HH:mm");
    if (!formattedTime.isValid()) {
      return res.status(400).json({ message: "Invalid time format" });
    }

    // Check for duplicate times
    const existingDuration = await Duration.findOne({
      where: { field_id: field_id, time: formattedTime.format("HH:mm") },
    });

    if (existingDuration) {
      return res.status(400).json({ message: "Duration already exists" });
    }

    const duration = await Duration.create({
      field_id,
      time: formattedTime.format("HH:mm"),
    });
    res.status(201).json(duration);
  } catch (error) {
    // Check if the error is due to uniqueness constraint violation
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Duration already exists" });
    }
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update a duration
const updateDuration = async (req, res) => {
  try {
    const { id } = req.params;
    const { time, field_id } = req.body;
    const duration = await Duration.findByPk(id);
    if (!duration) {
      return res.status(404).json({ message: "Duration not found" });
    }
    const field = await Field.findByPk(field_id);
    if (!field) {
      return res.status(404).json({ message: "Field not found" });
    }
    await duration.update({ time, field_id });
    res.status(200).json({ message: "Duration updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete a duration
const deleteDuration = async (req, res) => {
  try {
    const { id } = req.params;
    const duration = await Duration.findByPk(id);
    if (!duration) {
      return res.status(404).json({ message: "Duration not found" });
    }
    await duration.destroy();
    res.status(200).json({ message: "Duration deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all durations
const getAllDurations = async (req, res) => {
  try {
    const durations = await Duration.findAll();
    res.status(200).json(durations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Get durations of a field by its ID
const getDurationsByFieldId = async (req, res) => {
  try {
    const { fieldId } = req.params;
    const durations = await Duration.findAll({ where: { field_id: fieldId } });
    res.status(200).json(durations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createDuration,
  updateDuration,
  deleteDuration,
  getAllDurations,
  getDurationsByFieldId,
};
