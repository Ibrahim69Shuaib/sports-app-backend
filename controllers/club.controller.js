//TODO: functionality to block club by admin + handle what happens after blocking (restrict access to  some routes)

const db = require("../models");
const Club = db.club;
const RefundPolicy = db.refund_policy;
const Utilities = db.utilities;
const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const Reservation = db.reservation;
const Field = db.field;
const Duration = db.duration;
const Tournament = db.tournament;
const Decimal = require("decimal.js");
// create club profile
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
// get current club most booked field
async function getMostBookedField(req, res) {
  const { clubId } = req.params;

  try {
    if (!clubId) {
      return res.status(404).json({ message: "Club id is required" });
    }
    const mostBookedField = await Reservation.findAll({
      include: [
        {
          model: Duration,
          include: [
            {
              model: Field,
              where: { club_id: clubId },
              attributes: ["id", "description"],
            },
          ],
          attributes: [],
        },
      ],
      attributes: [
        [Sequelize.col("duration.field.id"), "fieldId"],
        [Sequelize.col("duration.field.description"), "fieldDescription"],
        [
          Sequelize.fn("COUNT", Sequelize.col("duration.field.id")),
          "booking_count",
        ],
      ],
      group: ["duration.field.id", "duration.field.description"],
      order: [[Sequelize.literal("booking_count"), "DESC"]],
      limit: 1,
    });

    if (mostBookedField.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings found for this club." });
    }
    const field = {
      id: mostBookedField[0].getDataValue("fieldId"),
      description: mostBookedField[0].getDataValue("fieldDescription"),
      booking_count: mostBookedField[0].getDataValue("booking_count"),
    };
    res.status(200).json(field);
  } catch (error) {
    console.error("Error fetching most booked field:", error);
    res.status(500).json({ message: "Failed to fetch most booked field." });
  }
}

// get current club most booked duration (time)
async function getMostBookedDuration(req, res) {
  const { clubId } = req.params;

  try {
    if (!clubId) {
      return res.status(404).json({ message: "Club id is required" });
    }
    const mostBookedDuration = await Reservation.findAll({
      include: [
        {
          model: Duration,
          include: [
            {
              model: Field,
              where: { club_id: clubId },
            },
          ],
          attributes: ["id", "time"],
        },
      ],
      attributes: [
        [Sequelize.col("duration.id"), "durationId"],
        [Sequelize.col("duration.time"), "time"],

        [Sequelize.fn("COUNT", Sequelize.col("duration.id")), "booking_count"],
      ],
      group: ["duration.id", "duration.time"],
      order: [[Sequelize.literal("booking_count"), "DESC"]],
      limit: 1,
    });

    if (mostBookedDuration.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings found for this club." });
    }

    const duration = {
      id: mostBookedDuration[0].getDataValue("durationId"),
      time: mostBookedDuration[0].getDataValue("time"),
      booking_count: mostBookedDuration[0].getDataValue("booking_count"),
    };

    res.status(200).json(duration);
  } catch (error) {
    console.error("Error fetching most booked duration:", error);
    res.status(500).json({ message: "Failed to fetch most booked duration." });
  }
}

// get current club most booked days
async function getMostBookedDay(req, res) {
  const { clubId } = req.params;

  try {
    if (!clubId) {
      return res.status(404).json({ message: "Club id is required" });
    }
    // Find all reservations related to the club
    const reservations = await Reservation.findAll({
      include: [
        {
          model: Duration,
          include: [
            {
              model: Field,
              where: { club_id: clubId },
              attributes: [], // Do not select Field attributes to simplify grouping
            },
          ],
          attributes: [], // Do not select Duration attributes to simplify grouping
        },
      ],
      attributes: [
        [
          Sequelize.fn("DAYOFWEEK", Sequelize.col("reservation.date")),
          "dayOfWeek",
        ],
        [
          Sequelize.fn("COUNT", Sequelize.col("reservation.id")),
          "booking_count",
        ],
      ],
      group: ["dayOfWeek"],
      order: [[Sequelize.literal("booking_count"), "DESC"]],
      limit: 1,
    });

    if (reservations.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings found for this club." });
    }

    const dayOfWeekMap = {
      1: "Sunday",
      2: "Monday",
      3: "Tuesday",
      4: "Wednesday",
      5: "Thursday",
      6: "Friday",
      7: "Saturday",
    };

    const mostBookedDayOfWeek = {
      day: dayOfWeekMap[reservations[0].getDataValue("dayOfWeek")],
      booking_count: reservations[0].getDataValue("booking_count"),
    };

    res.status(200).json(mostBookedDayOfWeek);
  } catch (error) {
    console.error("Error fetching most booked day of the week:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch most booked day of the week." });
  }
}
// get current club revenue for the current month
async function getCurrentMonthReservationsRevenue(req, res) {
  const { clubId } = req.params;

  try {
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const currentMonthEnd = new Date();
    currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);
    currentMonthEnd.setDate(1);
    currentMonthEnd.setHours(0, 0, 0, 0);

    const reservations = await Reservation.findAll({
      include: [
        {
          model: Duration,
          include: [
            {
              model: Field,
              where: { club_id: clubId },
              attributes: ["price"],
            },
          ],
          attributes: [],
        },
      ],
      attributes: ["id"], // Just to have some attribute from Reservation
      where: {
        date: {
          [Sequelize.Op.between]: [currentMonthStart, currentMonthEnd],
        },
        status: "completed",
      },
      raw: true,
    });

    const totalRevenue = reservations.reduce((sum, reservation) => {
      const price = new Decimal(reservation["duration.field.price"]);
      return sum.plus(price);
    }, new Decimal(0));

    res.status(200).json({ total_revenue: totalRevenue.toFixed(2) });
  } catch (error) {
    console.error("Error fetching current month reservations revenue:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch current month reservations revenue." });
  }
}
// get current club tournaments revenue for this month
async function getCurrentMonthTournamentsRevenue(req, res) {
  const { clubId } = req.params;

  try {
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const currentMonthEnd = new Date();
    currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);
    currentMonthEnd.setDate(1);
    currentMonthEnd.setHours(0, 0, 0, 0);

    const tournaments = await Tournament.findAll({
      where: {
        club_id: clubId,
        status: "completed", // Only consider completed tournaments
        end_date: {
          // Assuming end_date is when the tournament was completed
          [Sequelize.Op.between]: [currentMonthStart, currentMonthEnd],
        },
      },
      attributes: ["entry_fees"],
      raw: true,
    });

    const totalRevenue = tournaments.reduce((sum, tournament) => {
      return sum.plus(new Decimal(tournament.entry_fees));
    }, new Decimal(0));

    res.status(200).json({ total_revenue: totalRevenue.toFixed(2) });
  } catch (error) {
    console.error("Error fetching current month tournaments revenue:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch current month tournaments revenue." });
  }
}
// get current club total revenue for this month only
async function getCurrentMonthTotalRevenue(req, res) {
  const { clubId } = req.params;

  try {
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const currentMonthEnd = new Date();
    currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);
    currentMonthEnd.setDate(1);
    currentMonthEnd.setHours(0, 0, 0, 0);

    // Calculate reservation revenue
    const reservations = await Reservation.findAll({
      include: [
        {
          model: Duration,
          include: [
            {
              model: Field,
              where: { club_id: clubId },
              attributes: ["price"],
            },
          ],
          attributes: [],
        },
      ],
      attributes: ["id"], // Just to have some attribute from Reservation
      where: {
        date: {
          [Sequelize.Op.between]: [currentMonthStart, currentMonthEnd],
        },
        status: "completed",
      },
      raw: true,
    });
    // Filter out reservations with null field price
    const filteredReservations = reservations.filter(
      (reservation) => reservation["duration.field.price"] !== null
    );
    const reservationRevenue = filteredReservations.reduce(
      (sum, reservation) => {
        const price = new Decimal(reservation["duration.field.price"]);
        return sum.plus(price);
      },
      new Decimal(0)
    );

    // Calculate tournament revenue
    const tournaments = await Tournament.findAll({
      where: {
        club_id: clubId,
        status: "completed",
        end_date: {
          [Sequelize.Op.between]: [currentMonthStart, currentMonthEnd],
        },
      },
      attributes: ["entry_fees"],
      raw: true,
    });

    const tournamentRevenue = tournaments.reduce((sum, tournament) => {
      return sum.plus(new Decimal(tournament.entry_fees));
    }, new Decimal(0));

    // Calculate total revenue
    const totalRevenue = reservationRevenue.plus(tournamentRevenue);

    res.status(200).json({ total_revenue: totalRevenue.toFixed(2) });
  } catch (error) {
    console.error("Error fetching current month total revenue:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch current month total revenue." });
  }
}

// get current club total revenue
async function getTotalRevenue(req, res) {
  const { clubId } = req.params;

  try {
    // Calculate reservation revenue
    const reservations = await Reservation.findAll({
      include: [
        {
          model: Duration,
          include: [
            {
              model: Field,
              where: { club_id: clubId },
              attributes: ["price"],
            },
          ],
          attributes: [],
        },
      ],
      attributes: ["id"], // Just to have some attribute from Reservation
      where: {
        status: "completed",
      },
      raw: true,
    });

    // Filter out reservations with null field price
    const filteredReservations = reservations.filter(
      (reservation) => reservation["duration.field.price"] !== null
    );

    const reservationRevenue = filteredReservations.reduce(
      (sum, reservation) => {
        const price = new Decimal(reservation["duration.field.price"]);
        return sum.plus(price);
      },
      new Decimal(0)
    );

    // Calculate tournament revenue
    const tournaments = await Tournament.findAll({
      where: {
        club_id: clubId,
        status: "completed",
      },
      attributes: ["entry_fees"],
      raw: true,
    });

    const tournamentRevenue = tournaments.reduce((sum, tournament) => {
      return sum.plus(new Decimal(tournament.entry_fees));
    }, new Decimal(0));

    // Calculate total revenue
    const totalRevenue = reservationRevenue.plus(tournamentRevenue);

    res.status(200).json({ total_revenue: totalRevenue.toFixed(2) });
  } catch (error) {
    console.error("Error fetching total revenue:", error);
    res.status(500).json({ message: "Failed to fetch total revenue." });
  }
}

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
  getMostBookedField,
  getMostBookedDuration,
  getMostBookedDay,
  getCurrentMonthReservationsRevenue,
  getCurrentMonthTournamentsRevenue,
  getCurrentMonthTotalRevenue,
  getTotalRevenue,
};
