// functionality to block club by admin + handle what happens after blocking (restrict access to  some routes)

const db = require("../models");
const Club = db.club;

const createClub = async (req, res) => {
  try {
    const { name, description, location, pic, lat, lon } = req.body;

    // Assuming user information is available in req.user
    const userId = req.user.id;

    // Check if a player already exists for the given user_id
    const existingClub = await Club.findOne({ where: { user_id: userId } });

    if (existingClub) {
      return res
        .status(400)
        .json({ message: "Club already exists for this user" });
    }

    // Create a new club
    const club = await Club.create({
      name,
      description,
      location,
      pic,
      isBlocked,
      user_id: userId,
      lat,
      lon,
    });

    res.status(201).json("Club created successfully", club);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Update club information
const updateClub = async (req, res) => {
  try {
    const { name, description, location, pic, latitude, longitude } = req.body;
    const userId = req.user.id; // Assuming user information is available in req.user

    // Find the club
    const club = await Club.findOne({ where: { userId } });

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    // Update club information
    club.name = name;
    club.description = description;
    club.location = location;
    club.pic = pic;
    club.latitude = latitude;
    club.longitude = longitude;
    await club.save();

    res.status(200).json({ message: "Club updated successfully", club });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Get club information for the current logged-in user
const getClubForCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user information is available in req.user

    // Find the club for the current user
    const club = await Club.findOne({ where: { userId } });

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    res.status(200).json(club);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get club by ID
const getClubById = async (req, res) => {
  try {
    const clubId = req.params.id;

    // Find the club by ID
    const club = await Club.findByPk(clubId);

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    res.status(200).json(club);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Get club by name
const getClubByName = async (req, res) => {
  try {
    const clubName = req.params.name;

    // Find the club by name
    const club = await Club.findOne({ where: { name: clubName } });

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    res.status(200).json(club);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all clubs
const getAllClubs = async (req, res) => {
  try {
    // Find all clubs
    const clubs = await Club.findAll();

    res.status(200).json(clubs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all clubs with pagination
const getAllClubsWithPagination = async (req, res) => {
  try {
    const { page, pageSize } = req.query;
    const offset = (page - 1) * pageSize;

    // Find all clubs with pagination
    const clubs = await Club.findAll({
      offset,
      limit: parseInt(pageSize),
    });

    res.status(200).json(clubs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get club by username
const getClubByUsername = async (req, res) => {
  try {
    const username = req.params.username;

    // Find the user by username
    const user = await db.user.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the club associated with the user
    const club = await Club.findOne({ where: { userId: user.id } });

    if (!club) {
      return res.status(404).json({ message: "Club not found for this user" });
    }

    res.status(200).json(club);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createClub,
  updateClub,
  getClubForCurrentUser,
  getClubById,
  getClubByName,
  getAllClubs,
  getAllClubsWithPagination,
  getClubByUsername,
};
