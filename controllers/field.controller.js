const Decimal = require("decimal.js");
const db = require("../models");
const Field = db.field;
const Sport = db.sport;
const Club = db.club;
const Transaction = db.transaction;
const Wallet = db.wallet;
const Reservation = db.reservation;
const Duration = db.duration;
const Player = db.player;
const User = db.user;
const { Op } = require("sequelize");
const { addDays, isBefore, parseISO, isWithinInterval } = require("date-fns");
//TODO: when putting field under maintenance find reservations during maintenance date and full refund them creating 2 transactions one for the club and one for the reservation owner , but club reservations cannot be refunded , it has to be canceled by the club and use sequelize transactions to encapsulate it.
// find the all durations of that field => find all reservations with that duration => compare reservations date with start and end of field maintenance , if there is a reservation during that maintenance then fully refund it by creating transactions and deducting its full price from the club frozen wallet and then adding balance to the wallet of the reservation owner and change the reservation status to canceled and is_refunded to true.
// Create a new field
const createField = async (req, res) => {
  try {
    const {
      size,
      pic,
      description,
      duration,
      price,
      type,
      start_date,
      end_date,
      isUnderMaintenance,
      sport_id,
    } = req.body;
    // Assuming the user ID is available in req.user.id
    const club = await Club.findOne({ where: { user_id: req.user.id } });
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }
    const sport = await Sport.findOne({ where: { sport_id: sport_id } });
    if (!sport) {
      return res.status(404).json({ message: "Sport not found" });
    }
    if (isBefore(parseISO(end_date), parseISO(start_date))) {
      return res
        .status(404)
        .json({ message: "End date can't be before Start date." });
    }
    const field = await Field.create({
      size,
      pic,
      description,
      duration,
      price,
      type,
      start_date,
      end_date,
      isUnderMaintenance,
      club_id: club.id,
      sport_id,
    });
    res.status(201).json(field);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update a field
const updateField = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      size,
      pic,
      description,
      duration,
      price,
      type,
      start_date,
      end_date,
      sport_id,
    } = req.body;
    //find the field
    const field = await Field.findByPk(id);
    if (!field) {
      return res.status(404).json({ message: "Field not found" });
    }
    // Assuming the user ID is available in req.user.id
    const club = await Club.findOne({ where: { user_id: req.user.id } });
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }
    if (field.club_id !== club.id) {
      return res.status(403).json({ message: "Unauthorized operation" });
    }
    await field.update({
      size,
      pic,
      description,
      duration,
      price,
      type,
      start_date,
      end_date,
      sport_id,
    });
    res.status(200).json({ message: "Field updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete a field
const deleteField = async (req, res) => {
  try {
    const { id } = req.params;
    const field = await Field.findByPk(id);
    if (!field) {
      return res.status(404).json({ message: "Field not found" });
    }
    // Assuming the user ID is available in req.user.id
    const club = await Club.findOne({ where: { user_id: req.user.id } });
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }
    if (field.club_id !== club.id) {
      return res.status(403).json({ message: "Unauthorized operation" });
    }
    await field.destroy();
    res.status(200).json({ message: "Field deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Put a field under maintenance and refund all conflicting reservations
const putFieldUnderMaintenance = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.body;
    const parsedStartDate = new Date(start_date);
    const parsedEndDate = new Date(end_date);

    // Find the field by that id
    const field = await Field.findByPk(id);
    if (!field) {
      throw new Error("Field not found");
    }

    // Assuming the user ID is available in req.user.id
    const club = await Club.findOne({ where: { user_id: req.user.id } });
    if (!club) {
      throw new Error("Club not found");
    }
    if (field.club_id !== club.id) {
      throw new Error("Unauthorized operation");
    }
    if (isBefore(parseISO(end_date), parseISO(start_date))) {
      return res
        .status(404)
        .json({ message: "End date can't be before Start date." });
    }
    // Update field to under maintenance
    await field.update(
      {
        isUnderMaintenance: true,
        start_date: parsedStartDate,
        end_date: parsedEndDate,
      },
      { transaction }
    );

    // Find all durations for that field
    const durations = await Duration.findAll({
      where: { field_id: id },
    });

    // Find all incomplete reservations with those durations
    const reservations = await Reservation.findAll({
      where: {
        duration_id: {
          [db.Sequelize.Op.in]: durations.map((d) => d.id),
        },
        date: {
          [db.Sequelize.Op.between]: [parsedStartDate, parsedEndDate],
        },
        status: "incomplete", // Assuming 'incomplete' is the status for not yet fulfilled reservations
      },
      include: [
        {
          model: User,
          required: true, // Make the association required to ensure the user exists
          include: [
            {
              model: Wallet,
              as: "wallet", // Define the alias for the association
            },
          ],
        },
      ],
    });
    // Process refunds for each reservation found
    for (let reservation of reservations) {
      const refundAmount = field.price; // Using field.price as the refund amount
      const userWallet = reservation.user.wallet;
      const clubWallet = await Wallet.findOne({
        where: { user_id: club.user_id },
      });

      // using decimal js to work with wallets
      const playerBalance = new Decimal(userWallet.balance);
      const clubFrozenBalance = new Decimal(clubWallet.frozenBalance);
      const transferAmount = new Decimal(refundAmount);
      // adding and subtracting balance
      const newPlayerBalance = playerBalance.plus(transferAmount);
      const newClubFrozenBalance = clubFrozenBalance.minus(transferAmount);
      // Update the wallet balances
      userWallet.balance = newPlayerBalance.toNumber();
      clubWallet.frozenBalance = newClubFrozenBalance.toNumber();

      // Create transaction records for refund
      await Transaction.create(
        {
          user_id: reservation.user_id,
          amount: refundAmount,
          type: "refund",
          status: "completed",
          reservation_id: reservation.id,
        },
        { transaction }
      );

      await Transaction.create(
        {
          user_id: club.user_id,
          amount: -refundAmount,
          type: "refund",
          status: "completed",
          reservation_id: reservation.id,
        },
        { transaction }
      );

      // Update reservation status
      reservation.status = "canceled";
      reservation.is_refunded = true;
      await reservation.save({ transaction });

      // Save wallet updates
      await userWallet.save({ transaction });
      await clubWallet.save({ transaction });
    }

    await transaction.commit();
    res.status(200).json({
      message:
        "Field is now under maintenance and all conflicting reservations have been refunded.",
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({
      message: error.message,
      error: "Internal Server Error.",
    });
  }
};

// remove field from field maintenance
const setFieldMaintenanceStatus = async (req, res) => {
  const { id } = req.params;
  try {
    // Find the field by ID
    const field = await Field.findByPk(id);

    if (!field) {
      return res.status(404).json({ message: "Field not found" });
    }

    // Ensure that the field belongs to the club
    const club = await Club.findOne({ where: { user_id: req.user.id } });
    if (!club || field.club_id !== club.id) {
      return res.status(403).json({ message: "Unauthorized operation" });
    }

    // Update the field's maintenance status to false and remove start_date and end_date
    await Field.update(
      { isUnderMaintenance: false, start_date: null, end_date: null },
      { where: { id: id } }
    );

    res
      .status(200)
      .json({ message: "Maintenance status updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all fields
const getAllFields = async (req, res) => {
  try {
    const fields = await Field.findAll({
      include: [{ model: Sport }],
    });
    res.status(200).json(fields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Get all fields for current club
const getCurrentClubFields = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentClub = await Club.findOne({ where: { user_id: userId } });
    if (!currentClub) {
      return res.status(404).json({ message: "Club not found" });
    }
    const fields = await Field.findAll({
      where: { club_id: currentClub.id },
      include: [{ model: Sport }],
    });
    res.status(200).json(fields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get fields by size
const getFieldsBySize = async (req, res) => {
  try {
    const { minSize, maxSize } = req.query;
    const fields = await Field.findAll({
      where: {
        size: {
          [Op.between]: [minSize, maxSize],
        },
      },
    });
    res.status(200).json(fields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get fields by type
const getFieldsByType = async (req, res) => {
  try {
    const type = req.query.type;
    const fields = await Field.findAll({
      where: { type },
    });
    res.status(200).json(fields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get fields by duration
const getFieldsByDuration = async (req, res) => {
  try {
    const { minDuration, maxDuration } = req.query;
    const fields = await Field.findAll({
      where: {
        duration: {
          [Op.between]: [minDuration, maxDuration],
        },
      },
    });
    res.status(200).json(fields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get fields by club
const getFieldsByClub = async (req, res) => {
  try {
    const clubId = req.query.clubId;
    const fields = await Field.findAll({
      where: { club_id: clubId },
      include: [{ model: Sport }],
    });
    res.status(200).json(fields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get fields by sport
const getFieldsBySport = async (req, res) => {
  try {
    const sportId = req.query.sportId;
    const fields = await Field.findAll({
      where: { sport_id: sportId },
    });
    res.status(200).json(fields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createField,
  updateField,
  deleteField,
  putFieldUnderMaintenance,
  setFieldMaintenanceStatus,
  getAllFields,
  getFieldsBySize,
  getFieldsByType,
  getFieldsByDuration,
  getFieldsByClub,
  getFieldsBySport,
  getCurrentClubFields,
};
