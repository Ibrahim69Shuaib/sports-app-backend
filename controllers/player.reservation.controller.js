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
const isTransferSuccessful = async (playerWallet, clubWallet, price) => {
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
  await Promise.all([playerWallet.save(), clubWallet.save()]);

  return true; // Funds transfer successful
};
// Create a new  player reservation
const createPlayerReservation = async (req, res) => {
  const { durationId, date } = req.body;
  try {
    const userId = req.user.id;
    const type = "player";
    // Assuming you're using some authentication middleware
    const duration = await Duration.findByPk(durationId, {
      include: [{ model: Field }],
    });

    if (!duration || !duration.field) {
      return res
        .status(404)
        .json({ message: "Invalid duration or no associated field." });
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
    const field = duration.field;
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
    // Deduct amount from player's wallet and add to club's frozen wallet
    const clubUser = await Club.findByPk(duration.field.club_id);
    console.log("Club user fetched:", clubUser);
    console.log("the user id of the club is", clubUser.user_id);
    const playerWallet = await Wallet.findOne({ where: { user_id: userId } });
    const clubWallet = await Wallet.findOne({
      where: { user_id: clubUser.user_id }, // fixed
    });
    console.log("Player wallet fetched:", playerWallet);
    console.log("Club wallet fetched:", clubWallet);
    if (!playerWallet || !clubWallet) {
      return res.status(400).json({ message: "Wallet not found." });
    }

    const price = duration.field.price;

    const transferSuccess = await isTransferSuccessful(
      playerWallet,
      clubWallet,
      price
    );

    if (!transferSuccess) {
      // If transfer failed, update transaction status to failed
      await Transaction.create({
        user_id: userId,
        reservation_id: null,
        amount: price,
        type: "wallet_transfer",
        status: "failed",
      });
      return res.status(400).json({ message: "Funds transfer failed." });
    }

    // Create a pending transaction
    const transaction = await Transaction.create({
      user_id: userId,
      reservation_id: null, // initially
      amount: price,
      type: "wallet_transfer",
      status: "pending",
    });
    // Update the transaction with the reservation ID
    const reservation = await Reservation.create({
      user_id: userId,
      duration_id: durationId,
      type,
      status: "incomplete",
      date,
      is_refund: false,
    });

    transaction.reservation_id = reservation.id; // Assign the reservation ID
    await transaction.save();
    // If funds transfer is successful, update transaction status to completed
    transaction.status = "completed";
    await transaction.save();

    res.status(201).json(reservation);
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({
      message: "Failed to create reservation due to an internal error.",
    });
  }
};
module.exports = { createPlayerReservation };

// transaction is being created and reservation is being created even though the player has no enough funds in his wallet and server is crashing
// add reservation id to the transaction associated with it
