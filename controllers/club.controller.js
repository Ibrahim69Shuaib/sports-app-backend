//TODO: functionality to block club by admin + handle what happens after blocking (restrict access to  some routes)

const db = require("../models");
const Club = db.club;
const RefundPolicy = db.refund_policy;
const Utilities = db.utilities;
const { Op } = require("sequelize");
const Sequelize = require("sequelize");

const createClub = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      pic,
      lat,
      lon,
      workingHoursStart,
      workingHoursEnd,
    } = req.body;

    // Assuming user information is available in req.user
    const userId = req.user.id;

    // Check if a player already exists for the given user_id
    const existingClub = await Club.findOne({ where: { user_id: userId } });

    if (existingClub) {
      return res
        .status(400)
        .json({ message: "Club already exists for this user" });
    }

    // Check if working hours are provided
    if (!workingHoursStart || !workingHoursEnd) {
      return res.status(400).json({ message: "Working hours are required" });
    }

    // Create a new club
    const club = await Club.create({
      name,
      description,
      location,
      pic,
      user_id: userId,
      lat,
      lon,
      workingHoursStart,
      workingHoursEnd,
    });

    res.status(201).json(club);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update club information
const updateClub = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      pic,
      latitude,
      longitude,
      workingHoursStart,
      workingHoursEnd,
    } = req.body;
    const userId = req.user.id; // Assuming user information is available in req.user

    // Find the club
    const club = await Club.findOne({ where: { user_id: userId } });

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
    club.workingHoursStart = workingHoursStart;
    club.workingHoursEnd = workingHoursEnd;
    await club.update({
      name,
      description,
      location,
      pic,
      latitude,
      longitude,
      workingHoursStart,
      workingHoursEnd,
    });

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
    const club = await Club.findOne({
      where: { user_id: userId },
      include: [{ model: RefundPolicy }, { model: Utilities }],
    });

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
    const clubId = req.params.clubId;

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
    const clubName = req.params.clubName;

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
    const club = await Club.findOne({ where: { user_id: user.id } });

    if (!club) {
      return res.status(404).json({ message: "Club not found for this user" });
    }

    res.status(200).json(club);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const searchClub = async (req, res) => {
  const name = req.query.name; // Get the search query from the URL parameters
  if (!name) {
    return res.status(400).json({ message: "Name parameter is required" });
  }
  try {
    const clubs = await Club.findAll({
      where: Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("club.name")),
        {
          [Op.like]: `%${name.toLowerCase()}%`,
        }
      ),
    });

    res.status(200).json(clubs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
///////////////////////////////////////////////////////////////////////////////////////////
// Create a refund policy for a club
const createRefundPolicy = async (req, res) => {
  try {
    const userId = req.user.id;
    const { moreThanOneDay, oneDayBefore, duringReservation } = req.body;
    // Find the club for the current user
    const club = await Club.findOne({ where: { user_id: userId } });
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    // Check if a refund policy already exists for the club
    let refundPolicy = await RefundPolicy.findOne({
      where: { club_id: club.id },
    });
    if (refundPolicy) {
      return res
        .status(400)
        .json({ message: "Refund policy already exists for this club" });
    }

    // Create a new refund policy
    refundPolicy = await RefundPolicy.create({
      club_id: club.id,
      more_than_one_day: moreThanOneDay,
      one_day_before: oneDayBefore,
      during_reservation: duringReservation,
    });

    res.status(201).json(refundPolicy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Get refund policy for a club
const getRefundPolicy = async (req, res) => {
  try {
    const clubId = req.params.clubId;

    const refundPolicy = await RefundPolicy.findOne({
      where: { club_id: clubId },
    });
    if (!refundPolicy) {
      return res
        .status(404)
        .json({ message: "Refund policy not found for this club" });
    }

    res.status(200).json(refundPolicy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update refund policy for a club
const updateRefundPolicy = async (req, res) => {
  try {
    const userId = req.user.id;
    const { clubId } = req.params;
    const { moreThanOneDay, oneDayBefore, duringReservation } = req.body;
    // Find the club
    const club = await Club.findOne({ where: { id: clubId } });
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    // Check if the authenticated user is the owner of the club
    if (club.user_id !== userId) {
      return res.status(403).json({
        message:
          "You are not authorized to update the refund policy for this club",
      });
    }
    const refundPolicy = await RefundPolicy.findOne({
      where: { club_id: clubId },
    });
    if (!refundPolicy) {
      return res
        .status(404)
        .json({ message: "Refund policy not found for this club" });
    }

    // Update refund policy
    refundPolicy.more_than_one_day = moreThanOneDay;
    refundPolicy.one_day_before = oneDayBefore;
    refundPolicy.during_reservation = duringReservation;
    await refundPolicy.save();

    res.status(200).json(refundPolicy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete refund policy for a club (optional)
const deleteRefundPolicy = async (req, res) => {
  try {
    const userId = req.user.id;
    const clubId = req.params.clubId;
    // Find the club
    const club = await Club.findOne({ where: { id: clubId } });
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    // Check if the authenticated user is the owner of the club
    if (club.user_id !== userId) {
      return res.status(403).json({
        message:
          "You are not authorized to update the refund policy for this club",
      });
    }
    const refundPolicy = await RefundPolicy.findOne({
      where: { club_id: clubId },
    });
    if (!refundPolicy) {
      return res
        .status(404)
        .json({ message: "Refund policy not found for this club" });
    }

    await refundPolicy.destroy();

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// a request to check if the club has setup his profile or not
const isClubProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const club = await Club.findOne({ where: { user_id: userId } });
    if (club) {
      res.status(200).json({ isClubProfile: true });
    } else {
      res.status(200).json({ isClubProfile: false });
    }
  } catch (error) {
    console.error("Error checking club profile status:", error);
    res.status(500).json({ message: "Internal server error" });
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
  searchClub,
  createRefundPolicy,
  updateRefundPolicy,
  getRefundPolicy,
  deleteRefundPolicy,
  isClubProfile,
};
