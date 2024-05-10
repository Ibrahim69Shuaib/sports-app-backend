const db = require("../models"); // Adjust the path as necessary to your models
const Club = db.club;
const Utilities = db.utilities;

// Add a new utility
// possible to add a validation for the name besides the db validation
const addUtility = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Utility name is required" });
  }
  try {
    const newUtility = await Utilities.create({ name });
    res.status(201).json(newUtility);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding utility", error: error.message });
  }
};

// Edit an existing utility
const updateUtility = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const utility = await Utilities.findByPk(id);
    if (!utility) {
      return res.status(404).json({ message: "Utility not found" });
    }
    utility.name = name || utility.name;
    await utility.save();
    res.json(utility);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating utility", error: error.message });
  }
};

// Delete a utility
const deleteUtility = async (req, res) => {
  const { id } = req.params;
  try {
    const utility = await Utilities.findByPk(id);
    if (!utility) {
      return res.status(404).json({ message: "Utility not found" });
    }
    await utility.destroy();
    res.json({ message: "Utility deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting utility", error: error.message });
  }
};

// Get all utilities
const getAllUtilities = async (req, res) => {
  try {
    const utilities = await Utilities.findAll();
    res.json(utilities);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving utilities", error: error.message });
  }
};

// Get a single utility by ID
const getUtilityById = async (req, res) => {
  const { id } = req.params;
  try {
    const utility = await Utilities.findByPk(id);
    if (!utility) {
      return res.status(404).json({ message: "Utility not found" });
    }
    res.json(utility);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving utility", error: error.message });
  }
};

// JUNCTION TABLE FUNCTIONS
////////////////////////////////////////////
async function addUtilityToClub(req, res) {
  const { clubId, utilityId } = req.body;
  try {
    const club = await Club.findByPk(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    const utility = await Utilities.findByPk(utilityId);
    if (!utility) {
      return res.status(404).json({ message: "Utility not found" });
    }

    // Check if the utility is already associated with the club
    const utilities = await club.getUtilities({ where: { id: utilityId } });
    if (utilities.length > 0) {
      return res.status(400).json({ message: "Utility already added to club" });
    }

    await club.addUtility(utility);
    res.status(201).json({ message: "Utility added successfully" });
  } catch (error) {
    console.error("Error adding utility to club:", error);
    res.status(500).json({ message: "Failed to add utility to club" });
  }
}
async function removeUtilityFromClub(req, res) {
  const { clubId, utilityId } = req.body;
  try {
    const club = await Club.findByPk(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    // Check if the utility is actually associated with the club
    const utilities = await club.getUtilities({ where: { id: utilityId } });
    if (utilities.length === 0) {
      return res.status(404).json({ message: "Utility not found in club" });
    }

    await club.removeUtility(utilities[0]); // removes the first instance of the utility
    res.status(200).json({ message: "Utility removed successfully" });
  } catch (error) {
    console.error("Error removing utility from club:", error);
    res.status(500).json({ message: "Failed to remove utility from club" });
  }
}

// Function to get club utilities by club ID
async function getClubUtilitiesByClubId(req, res) {
  const { clubId } = req.params;

  try {
    // Find the club by ID
    const club = await Club.findByPk(clubId);

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    // Get the utilities associated with the club
    const utilities = await club.getUtilities();

    res.status(200).json(utilities);
  } catch (error) {
    console.error("Error fetching club utilities:", error);
    res.status(500).json({ message: "Failed to fetch club utilities" });
  }
}

module.exports = {
  getClubUtilitiesByClubId,
  addUtilityToClub,
  removeUtilityFromClub,
  addUtility,
  updateUtility,
  deleteUtility,
  getAllUtilities,
  getUtilityById,
};
