const db = require("../models");
const Duration = db.duration;
const Field = db.field;

// Create a new duration for a field
const createDuration = async (req, res) => {
  try {
    const { field_id, time } = req.body;
    const field = await Field.findByPk(field_id);
    if (!field) {
      return res.status(404).json({ message: "Field not found" });
    }

    const duration = await Duration.create({ field_id, time });
    res.status(201).json(duration);
  } catch (error) {
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
