//TODO: USE SEQUELIZE TRANSACTIONS
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
  const userId = req.user.id;
  const type = "club";
  let transaction;
  try {
    transaction = await db.sequelize.transaction(async (t) => {
      // Assuming you're using some authentication middleware
      const duration = await Duration.findByPk(durationId, {
        include: [{ model: Field }],
        transaction: t,
      });

      if (!duration || !duration.field) {
        throw new Error("Invalid duration or no associated field.");
      }
      // Check field ownership
      const field = duration.field;
      const club = await Club.findByPk(field.club_id);
      if (!club || club.user_id !== userId) {
        throw new Error("You can only make a reservation on fields you own.");
      }
      if (isBefore(parseISO(date), new Date())) {
        throw new Error("Cannot book on past date.");
      }

      if (!(await isFieldAvailable(duration.id, date))) {
        throw new Error("Field is not available at the selected time.");
      }
      // Check if the field is under maintenance
      const startDate = new Date(duration.field.start_date);
      const endDate = new Date(duration.field.end_date);

      if (
        duration.field.isUnderMaintenance &&
        startDate instanceof Date &&
        !isNaN(startDate) &&
        endDate instanceof Date &&
        !isNaN(endDate) &&
        isWithinInterval(date, { start: startDate, end: endDate })
      ) {
        console.error(
          `Attempt to book during maintenance: ${date} falls between ${startDate} and ${endDate}`
        );
        throw new Error("Field is under maintenance on the selected date.");
      }
      // Update the transaction with the reservation ID
      const reservation = await Reservation.create(
        {
          user_id: userId,
          duration_id: durationId,
          type,
          status: "incomplete",
          date,
          is_refund: false,
        },
        { transaction: t }
      );
      return reservation; // This will be the response if everything succeeds
    });
    res.status(201).json(transaction);
  } catch (error) {
    // If there's an error, rollback any changes
    if (transaction) await transaction.rollback();
    console.error("Error creating reservation:", error);
    res.status(500).json({
      message: error.message,
      error: "Failed to create reservation due to an internal error.",
    });
  }
};

// cancel reservation
const cancelReservation = async (req, res) => {
  const { reservationId } = req.params;
  const userId = req.user.id;
  let transaction;
  try {
    transaction = await db.sequelize.transaction(async (t) => {
      // finding the reservation
      const reservation = await Reservation.findByPk(reservationId, {
        transaction: t,
      });
      if (!reservation) {
        throw new Error("No reservation found");
      }
      // checking reservation type
      if (reservation.type !== "club") {
        throw new Error("You can only cancel club type reservations");
      }
      // Check if reservation status is complete
      if (reservation.status === "completed") {
        throw new Error("Can't cancel an already completed reservation");
      }
      // Check if reservation status is canceled or refunded
      if (reservation.status === "canceled" || reservation.is_refunded == "1") {
        throw new Error(
          "Can't cancel an already canceled or refunded reservation"
        );
      }
      // finding the duration
      const duration = await Duration.findByPk(reservation.duration_id, {
        include: [{ model: Field }],
        transaction: t,
      });

      if (!duration || !duration.field) {
        throw new Error("Invalid duration or no associated field.");
      }
      // Check field ownership
      const field = duration.field;
      const club = await Club.findByPk(field.club_id);
      if (!club || club.user_id !== userId) {
        throw new Error("You can only cancel a reservation on fields you own.");
      }
      // if (reservation.user_id !== userId) {
      // throw new Error ("You can only cancel your own reservations.")
      // }
      // Change reservation status to canceled
      reservation.status = "canceled";
      await reservation.save({ transaction: t });
      return reservation;
    });
    res.status(201).json(transaction);
  } catch (error) {
    // If there's an error, rollback any changes
    if (transaction) await transaction.rollback();
    console.error("Error canceling reservation:", error);
    res.status(500).json({
      message: error.message,
      error: "Failed to cancel reservation due to an internal error.",
    });
  }
};

module.exports = { createClubReservation, cancelReservation };
