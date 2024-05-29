const Decimal = require("decimal.js");
const db = require("../models");
const Reservation = db.reservation;
const Field = db.field;
const Duration = db.duration;
const Wallet = db.wallet;
const Transaction = db.transaction;
const Player = db.player;
const Club = db.club;
const {
  startOfDay,
  addDays,
  isBefore,
  parseISO,
  isWithinInterval,
} = require("date-fns");

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
async function isTransferSuccessful(playerWallet, clubWallet, price, t) {
  const playerBalance = new Decimal(playerWallet.balance);
  const priceDecimal = new Decimal(price);

  console.log("Player balance:", playerBalance.toString());
  console.log("Price:", priceDecimal.toString());

  if (playerBalance.lessThan(priceDecimal)) {
    console.log("Insufficient funds for the transaction.");
    return false; // Funds transfer unsuccessful
  }

  const frozenBalance = new Decimal(clubWallet.frozenBalance);
  clubWallet.frozenBalance = frozenBalance.plus(priceDecimal).toNumber();

  console.log("Updated club wallet:", clubWallet);

  playerWallet.balance = playerBalance.minus(priceDecimal).toNumber();
  // Save both wallets within the same transaction
  await playerWallet.save({ transaction: t });
  await clubWallet.save({ transaction: t });

  return true; // Funds transfer successful
}

// Function to get field availability for a specified number of days
async function checkFieldAvailability(req, res) {
  const { durationId } = req.params;
  const days = parseInt(req.query.days) || 30; // Read days from query params, default to 30 if not provided
  const today = startOfDay(new Date());
  const availability = [];

  try {
    for (let i = 0; i < days; i++) {
      const checkDate = startOfDay(addDays(today, i))
        .toISOString()
        .split("T")[0]; // Ensure DATEONLY format
      const isAvailable = await isFieldAvailable(durationId, checkDate);
      availability.push({
        date: checkDate,
        isAvailable,
      });
    }
    res.status(200).json(availability);
  } catch (error) {
    console.error("Error checking field availability:", error);
    res.status(500).json({
      message: "Failed to check field availability due to an internal error.",
    });
  }
}
// Create a new  player reservation
async function createPlayerReservation(req, res) {
  const { durationId, date } = req.body;
  const userId = req.user.id;
  const type = "player";
  let transaction;
  try {
    // Start a transaction
    transaction = await db.sequelize.transaction(async (t) => {
      // Fetch necessary data within the transaction
      const duration = await Duration.findByPk(durationId, {
        include: [{ model: Field }],
        transaction: t,
      });

      // All validation and business logic checks
      if (!duration || !duration.field) {
        throw new Error("Invalid duration or no associated field.");
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
      // Wallet operations
      const clubUser = await Club.findByPk(duration.field.club_id, {
        transaction: t,
      });
      const playerWallet = await Wallet.findOne({
        where: { user_id: userId },
        transaction: t,
      });
      const clubWallet = await Wallet.findOne({
        where: { user_id: clubUser.user_id },
        transaction: t,
      });

      if (!playerWallet || !clubWallet) {
        throw new Error("Wallet not found.");
      }

      // Perform fund transfer
      if (
        !(await isTransferSuccessful(
          playerWallet,
          clubWallet,
          duration.field.price,
          t
        ))
      ) {
        // Log failed transaction
        await Transaction.create(
          {
            user_id: userId,
            reservation_id: null,
            amount: duration.field.price,
            type: "wallet_transfer",
            status: "failed",
          },
          { transaction: t }
        );
        throw new Error("Funds transfer failed.");
      }

      // Create the reservation
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

      // Create and update transaction
      const UserTransactionRecord = await Transaction.create(
        {
          user_id: userId,
          reservation_id: reservation.id,
          amount: duration.field.price,
          type: "wallet_transfer",
          status: "pending",
        },
        { transaction: t }
      );
      const ClubTransactionRecord = await Transaction.create(
        {
          user_id: clubUser.user_id, // club user id
          reservation_id: reservation.id,
          amount: -duration.field.price,
          type: "wallet_transfer",
          status: "pending",
        },
        { transaction: t }
      );

      UserTransactionRecord.status = "completed";
      ClubTransactionRecord.status = "completed";
      await UserTransactionRecord.save({ transaction: t });
      await ClubTransactionRecord.save({ transaction: t });

      return reservation; // This will be the response if everything succeeds
    });

    // If the transaction is successful, send the reservation data
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
}
module.exports = { createPlayerReservation, checkFieldAvailability };
