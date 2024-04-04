const db = require("../models");
const Field = db.field;
const Sport = db.sport;
const Club = db.club;
const { Op } = require("sequelize");
//TODO: need to modify maintenance logic to include reservations and refunds
// Create a new field
const createField = async (req, res) => {
  try {
    const {
      size,
      pic,
      description,
      duration,
      price,
      type,
      start_date,
      end_date,
      isUnderMaintenance,
      sport_id,
    } = req.body;
    // Assuming the user ID is available in req.user.id
    const club = await Club.findOne({ where: { user_id: req.user.id } });
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }
    const field = await Field.create({
      size,
      pic,
      description,
      duration,
      price,
      type,
      start_date,
      end_date,
      isUnderMaintenance,
      club_id: club.id,
      sport_id,
    });
    res.status(201).json(field);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update a field
const updateField = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      size,
      pic,
      description,
      duration,
      price,
      type,
      start_date,
      end_date,
      sport_id,
    } = req.body;
    //find the field
    const field = await Field.findByPk(id);
    if (!field) {
      return res.status(404).json({ message: "Field not found" });
    }
    // Assuming the user ID is available in req.user.id
    const club = await Club.findOne({ where: { user_id: req.user.id } });
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }
    if (field.club_id !== club.id) {
      return res.status(403).json({ message: "Unauthorized operation" });
    }
    await field.update({
      size,
      pic,
      description,
      duration,
      price,
      type,
      start_date,
      end_date,
      sport_id,
    });
    res.status(200).json({ message: "Field updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete a field
const deleteField = async (req, res) => {
  try {
    const { id } = req.params;
    const field = await Field.findByPk(id);
    if (!field) {
      return res.status(404).json({ message: "Field not found" });
    }
    // Assuming the user ID is available in req.user.id
    const club = await Club.findOne({ where: { user_id: req.user.id } });
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }
    if (field.club_id !== club.id) {
      return res.status(403).json({ message: "Unauthorized operation" });
    }
    await field.destroy();
    res.status(200).json({ message: "Field deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Put a field under maintenance
const putFieldUnderMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.body;
    // find the field by that id
    const field = await Field.findByPk(id);
    if (!field) {
      return res.status(404).json({ message: "Field not found" });
    }
    // Assuming the user ID is available in req.user.id
    const club = await Club.findOne({ where: { user_id: req.user.id } });
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }
    if (field.club_id !== club.id) {
      return res.status(403).json({ message: "Unauthorized operation" });
    }

    await field.update({
      isUnderMaintenance: true,
      start_date,
      end_date,
    });
    res.status(200).json({ message: "Field is now under maintenance" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const setFieldMaintenanceStatus = async (req, res) => {
  const { id } = req.params;
  try {
    // Find the field by ID
    const field = await Field.findByPk(id);

    if (!field) {
      return res.status(404).json({ message: "Field not found" });
    }

    // Ensure that the field belongs to the club
    const club = await Club.findOne({ where: { user_id: req.user.id } });
    if (!club || field.club_id !== club.id) {
      return res.status(403).json({ message: "Unauthorized operation" });
    }

    // Update the field's maintenance status to false and remove start_date and end_date
    await Field.update(
      { isUnderMaintenance: false, start_date: null, end_date: null },
      { where: { id: id } }
    );

    res
      .status(200)
      .json({ message: "Maintenance status updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all fields
const getAllFields = async (req, res) => {
  try {
    const fields = await Field.findAll();
    res.status(200).json(fields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get fields by size
const getFieldsBySize = async (req, res) => {
  try {
    const { minSize, maxSize } = req.query;
    const fields = await Field.findAll({
      where: {
        size: {
          [Op.between]: [minSize, maxSize],
        },
      },
    });
    res.status(200).json(fields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get fields by type
const getFieldsByType = async (req, res) => {
  try {
    const type = req.query.type;
    const fields = await Field.findAll({
      where: { type },
    });
    res.status(200).json(fields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get fields by duration
const getFieldsByDuration = async (req, res) => {
  try {
    const { minDuration, maxDuration } = req.query;
    const fields = await Field.findAll({
      where: {
        duration: {
          [Op.between]: [minDuration, maxDuration],
        },
      },
    });
    res.status(200).json(fields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get fields by club
const getFieldsByClub = async (req, res) => {
  try {
    const clubId = req.query.clubId;
    const fields = await Field.findAll({
      where: { club_id: clubId },
    });
    res.status(200).json(fields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get fields by sport
const getFieldsBySport = async (req, res) => {
  try {
    const sportId = req.query.sportId;
    const fields = await Field.findAll({
      where: { sport_id: sportId },
    });
    res.status(200).json(fields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createField,
  updateField,
  deleteField,
  putFieldUnderMaintenance,
  setFieldMaintenanceStatus,
  getAllFields,
  getFieldsBySize,
  getFieldsByType,
  getFieldsByDuration,
  getFieldsByClub,
  getFieldsBySport,
};
