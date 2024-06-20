// change file name to team reservation and create 2 other controllers for each type
const Decimal = require("decimal.js");
const db = require("../models");
const Reservation = db.reservation;
const Field = db.field;
const Duration = db.duration;
const Wallet = db.wallet;
const Transaction = db.transaction;
const Player = db.player;
const Team = db.team;
const Club = db.club;
const { addDays, isBefore, parseISO, isWithinInterval } = require("date-fns");

// Helper function to check if the field is already booked
const isFieldAvailable = async (durationId, date) => {
  const reservation = await Reservation.findOne({
    where: {
      duration_id: durationId,
      date,
      status: { [db.Sequelize.Op.not]: "canceled" },
    },
  });
  return !reservation;
};
const isUserTeamCaptain = async (userId) => {
  const player = await Player.findOne({
    where: { user_id: userId },
  });
  if (!player) {
    return false;
  }
  const team = await Team.findByPk(player.team_id);
  return team && team.captain_id === player.id;
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
// Create a new  team reservation
async function createTeamReservation(req, res) {
  const { durationId, date } = req.body;
  const userId = req.user.id;
  const type = "team"; // Hardcode the type as "team"
  let transaction;
  try {
    transaction = await db.sequelize.transaction(async (t) => {
      // Fetch necessary data within the transaction
      const duration = await Duration.findByPk(durationId, {
        include: [{ model: Field }],
        transaction: t,
      });

      if (!duration || !duration.field) {
        throw new Error("Invalid duration or no associated field.");
      }

      if (type === "team" && !(await isUserTeamCaptain(userId))) {
        throw new Error("User must be a team captain to book for a team.");
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

      const price = duration.field.price;

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
        throw new Error("Insufficient funds ,Funds transfer failed.");
      }

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

module.exports = {
  createTeamReservation,
};
