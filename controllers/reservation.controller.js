const Decimal = require("decimal.js");
const db = require("../models");
// const Sequelize = require("sequelize");
const Reservation = db.reservation;
const Field = db.field;
const Duration = db.duration;
const Wallet = db.wallet;
const Transaction = db.transaction;
const Player = db.player;
const Club = db.club;
const RefundPolicy = db.refund_policy;
const Post = db.post;
const Request = db.request;
const { addDays, isBefore, parseISO, differenceInDays } = require("date-fns");

const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll();
    res.status(200).json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({
      message: "Failed to fetch reservations due to an internal error.",
    });
  }
};
const getAllReservationsWithPagination = async (req, res) => {
  // Set default values for pagination
  let { page, limit } = req.query;
  page = page ? parseInt(page, 10) : 1; // default to first page
  limit = limit ? parseInt(limit, 10) : 10; // default limit to 10 items per page
  const offset = (page - 1) * limit;

  try {
    const { count, rows } = await Reservation.findAndCountAll({
      limit: limit,
      offset: offset,
      order: [["createdAt", "DESC"]], // Orders the results by creation date, descending
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      totalPages: totalPages,
      currentPage: page,
      totalCount: count,
      reservations: rows,
    });
  } catch (error) {
    console.error("Error fetching paginated reservations:", error);
    res.status(500).json({
      message: "Failed to fetch reservations due to an internal error.",
    });
  }
};

const getReservationById = async (req, res) => {
  const { id } = req.params;
  try {
    const reservation = await Reservation.findByPk(id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }
    res.status(200).json(reservation);
  } catch (error) {
    console.error("Error fetching reservation:", error);
    res.status(500).json({
      message: "Failed to fetch reservation due to an internal error.",
    });
  }
};

const getReservationsByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const reservations = await Reservation.findAll({
      where: { user_id: userId },
    });
    res.status(200).json(reservations);
  } catch (error) {
    console.error("Error fetching reservations by user:", error);
    res.status(500).json({
      message: "Failed to fetch reservations due to an internal error.",
    });
  }
};

const getReservationsByClubId = async (req, res) => {
  const { clubId } = req.params;
  try {
    const reservations = await Reservation.findAll({
      include: [
        {
          model: Duration,
          include: [
            {
              model: Field,
              where: { club_id: clubId },
            },
          ],
        },
      ],
    });
    res.status(200).json(reservations);
  } catch (error) {
    console.error("Error fetching reservations by club:", error);
    res.status(500).json({
      message: "Failed to fetch reservations due to an internal error.",
    });
  }
};

const getReservationsByFieldId = async (req, res) => {
  const { fieldId } = req.params;
  try {
    const reservations = await Reservation.findAll({
      include: [
        {
          model: Duration,
          where: { field_id: fieldId },
        },
      ],
    });
    res.status(200).json(reservations);
  } catch (error) {
    console.error("Error fetching reservations by field:", error);
    res.status(500).json({
      message: "Failed to fetch reservations due to an internal error.",
    });
  }
};

const getReservationsByDate = async (req, res) => {
  const { date } = req.params; // Expected in YYYY-MM-DD format
  try {
    const reservations = await Reservation.findAll({
      where: { date },
    });
    res.status(200).json(reservations);
  } catch (error) {
    console.error("Error fetching reservations by date:", error);
    res.status(500).json({
      message: "Failed to fetch reservations due to an internal error.",
    });
  }
};

// refund code
// TODO: Find related posts and delete them if found after the refund is processed
const processRefund = async (req, res) => {
  const userId = req.user.id;
  const { reservationId } = req.params;
  const transaction = await db.sequelize.transaction(); // starting a new transaction
  try {
    const reservation = await Reservation.findByPk(reservationId, {
      include: [
        {
          model: Duration,
          include: [
            {
              model: Field,
              include: [
                {
                  model: Club,
                  include: [
                    {
                      model: RefundPolicy,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      transaction: transaction,
    });

    if (!reservation) {
      throw new Error("Reservation not found.");
    }
    if (reservation.user_id !== userId) {
      throw new Error("You can only refund your own reservations.");
    }
    // Check if reservation status is complete
    if (reservation.status === "completed") {
      throw new Error("Cannot refund a completed reservation.");
    }
    if (reservation.status === "canceled" || reservation.is_refunded == "1") {
      throw new Error("Cannot refund a canceled or refunded reservation.");
    }
    if (reservation.type === "club") {
      throw new Error("You cannot refund this type of reservation.");
    }
    const duration = await Duration.findByPk(reservation.duration_id, {
      transaction: transaction,
    });
    if (!duration) {
      throw new Error("Duration not found.");
    }
    const field = await Field.findByPk(duration.field_id, {
      transaction: transaction,
    });
    if (!field) {
      throw new Error("Field not found.");
    }
    const price = field.price;
    const priceDecimal = new Decimal(price);
    const today = new Date();
    const reservationDate = parseISO(reservation.date);
    const daysDiff = differenceInDays(reservationDate, today);

    let refundPercentage = 0;
    const policy = reservation.duration.field.club.refundpolicy;
    // console.log(reservation.duration.field.club.refundpolicy);
    // console.log(reservation);
    // console.log(policy);
    if (daysDiff > 1) {
      refundPercentage = policy.more_than_one_day;
    } else if (daysDiff === 1) {
      // might need to be replaced with only ==
      refundPercentage = policy.one_day_before;
    } else if (daysDiff === 0) {
      refundPercentage = policy.during_reservation;
    }

    // Calculate refund amount using field price instead of reservation amount
    const refundAmount = priceDecimal.mul(refundPercentage / 100).toNumber();
    console.log(refundAmount);
    // Process the refund by updating balances and creating transaction records
    const playerWallet = await Wallet.findOne({
      where: { user_id: reservation.user_id },
      transaction: transaction,
    });
    const clubWallet = await Wallet.findOne({
      where: { user_id: reservation.duration.field.club.user_id },
      transaction: transaction,
    });

    if (!playerWallet || !clubWallet) {
      throw new Error("Player or club wallet not found.");
    }

    // Add refunded amount to player balance and deduct from club frozen balance
    const playerBalance = new Decimal(playerWallet.balance);
    const clubFrozenBalance = new Decimal(clubWallet.frozenBalance);

    playerWallet.balance = playerBalance.plus(refundAmount).toNumber();
    clubWallet.frozenBalance = clubFrozenBalance.minus(refundAmount).toNumber();

    // Save wallet updates within the transaction if transaction fails it rolls backs so no partially updated attributes or tables
    await Promise.all([
      playerWallet.save({ transaction: transaction }),
      clubWallet.save({ transaction: transaction }),
    ]);
    // Create transaction records for the refund
    const playerTransaction = await Transaction.create(
      {
        user_id: reservation.user_id,
        amount: refundAmount,
        type: "refund",
        status: "completed",
        reservation_id: reservation.id,
      },
      { transaction: transaction }
    );

    const clubTransaction = await Transaction.create(
      {
        user_id: reservation.duration.field.club.user_id,
        amount: -refundAmount, // Negative amount for club transaction
        type: "refund",
        status: "completed",
        reservation_id: reservation.id,
      },
      { transaction: transaction }
    );
    if (reservation.type === "team") {
      // Find any related posts and delete them
      const posts = await Post.findAll({
        where: { reservation_id: reservation.id },
        transaction: transaction,
      });

      await Promise.all(
        posts.map(async (post) => {
          // Find requests related to the post
          const requests = await Request.findAll({
            where: { post_id: post.id },
            transaction: transaction,
          });

          // Delete the requests related to the post
          await Promise.all(
            requests.map(async (request) => {
              await request.destroy({ transaction: transaction });
            })
          );

          // Delete the post
          await post.destroy({ transaction: transaction });
        })
      );
    }
    // Change reservation status to canceled and set is_refunded to true
    reservation.status = "canceled";
    reservation.is_refunded = true;
    await reservation.save({ transaction: transaction });
    await transaction.commit(); // Commit the transaction
    res
      .status(200)
      .json({ message: "Refund processed", amountRefunded: refundAmount });
  } catch (error) {
    await transaction.rollback(); // Rollback the transaction
    console.error("Error processing refund:", error);
    res.status(500).json({
      message: error.message,
      error: "Failed to create reservation due to an internal error.",
    });
  }
};

module.exports = {
  getAllReservations,
  getAllReservationsWithPagination,
  getReservationById,
  getReservationsByClubId,
  getReservationsByDate,
  getReservationsByFieldId,
  getReservationsByUserId,
  processRefund,
};
