const Decimal = require("decimal.js");
const db = require("../models");
const Reservation = db.reservation;
const Field = db.field;
const Duration = db.duration;
const Wallet = db.wallet;
const Transaction = db.transaction;
const Player = db.player;
const Club = db.club;
const { addDays, isBefore, parseISO, isWithinInterval } = require("date-fns");

// Helper function to check if the field is already booked
const isFieldAvailable = async (durationId, date) => {
  // need to be replaced with durationId / duration.id instead of  fieldId and time
  const reservation = await Reservation.findOne({
    where: {
      duration_id: durationId,
      date,
      status: { [db.Sequelize.Op.not]: "canceled" },
    },
  });
  return !reservation;
};
// Create a new club reservation
const createClubReservation = async (req, res) => {
  const { durationId, date } = req.body;
  try {
    const userId = req.user.id;
    const type = "club";
    // Assuming you're using some authentication middleware
    const duration = await Duration.findByPk(durationId, {
      include: [{ model: Field }],
    });

    if (!duration || !duration.field) {
      return res
        .status(404)
        .json({ message: "Invalid duration or no associated field." });
    }
    // Check field ownership
    const field = duration.field;
    const club = await Club.findByPk(field.club_id);
    if (!club || club.user_id !== userId) {
      return res
        .status(403)
        .json({ message: "You can only make a reservation on fields you own" });
    }
    if (isBefore(parseISO(date), new Date())) {
      return res.status(400).json({ message: "Cannot book on past date." });
    }

    if (!(await isFieldAvailable(duration.id, date))) {
      return res
        .status(400)
        .json({ message: "Field is not available at the selected time." });
    }
    // Check if the field is under maintenance TODO: needs testing
    if (
      field.isUnderMaintenance &&
      field.start_date &&
      field.end_date &&
      isWithinInterval(parseISO(date), {
        start: parseISO(field.start_date),
        end: parseISO(field.end_date),
      })
    ) {
      return res
        .status(400)
        .json({ message: "Field is under maintenance on the selected date." });
    }
    // Update the transaction with the reservation ID
    const reservation = await Reservation.create({
      user_id: userId,
      duration_id: durationId,
      type,
      status: "incomplete",
      date,
      is_refund: false,
    });

    res.status(201).json(reservation);
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({
      message: "Failed to create reservation due to an internal error.",
    });
  }
};
module.exports = { createClubReservation };

// cancel reservation
