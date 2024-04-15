const db = require("../models");
const Wallet = db.wallet;
const Transaction = db.transaction;
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const { startOfDay, endOfDay } = require("date-fns");

// Create transaction
const createTransaction = async (amount, type, paymentIntentId, user_id) => {
  try {
    const transaction = await Transaction.create({
      amount,
      type,
      paymentIntentId,
      user_id,
    });
    return transaction;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
};

// Update transaction status to completed and add funds to user wallet
const completeTransaction = async (paymentIntentId, userId, amount) => {
  try {
    // Update transaction status to completed
    await Transaction.update(
      { status: "completed" },
      { where: { paymentIntentId } }
    );

    // Add funds to user's wallet
    const userWallet = await Wallet.findOne({ where: { user_id: userId } });
    if (userWallet) {
      // Update wallet balance
      await userWallet.increment("balance", { by: amount });
    } else {
      throw new Error("User wallet not found");
    }
  } catch (error) {
    console.error("Error completing transaction:", error);
    // Update transaction status to failed
    await Transaction.update(
      { status: "failed" },
      { where: { paymentIntentId } }
    );
    throw error;
  }
};
// Get all transactions with pagination
const getAllTransactions = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const transactions = await Transaction.findAndCountAll({
      offset,
      limit,
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Error fetching transactions" });
  }
};

// Get transactions with filters by type and status
// careful with white spaces for ENUM values
const getFilteredTransactions = async (req, res) => {
  const { type, status } = req.query;

  try {
    let whereClause = {};
    if (type) {
      whereClause.type = type;
    }
    if (status) {
      whereClause.status = status;
    }

    console.log("Where Clause:", whereClause);

    const filteredTransactions = await Transaction.findAll({
      where: whereClause,
    });

    console.log("Filtered Transactions:", filteredTransactions);

    res.status(200).json(filteredTransactions);
  } catch (error) {
    console.error("Error fetching filtered transactions:", error);
    res.status(500).json({ error: "Error fetching filtered transactions" });
  }
};

// Get transactions of a certain user by user ID
const getUserTransactions = async (req, res) => {
  const userId = req.params.userId;

  try {
    const userTransactions = await Transaction.findAll({
      where: { user_id: userId },
    });

    res.status(200).json(userTransactions);
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    res.status(500).json({ error: "Error fetching user transactions" });
  }
};

// Get transactions within a specific date range
const getTransactionsByDateRange = async (req, res) => {
  const { startDate, endDate } = req.query;

  // Convert date strings to Date objects with time set to the beginning/end of the day
  const formattedStartDate = startOfDay(new Date(startDate));
  const formattedEndDate = endOfDay(new Date(endDate));

  try {
    const transactions = await Transaction.findAll({
      where: {
        createdAt: {
          [Op.between]: [formattedStartDate, formattedEndDate],
        },
      },
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions by date range:", error);
    res
      .status(500)
      .json({ error: "Error fetching transactions by date range" });
  }
};

// Get summary statistics for transactions
// Get summary statistics for transactions
const getTransactionSummary = async (req, res) => {
  try {
    const summary = await Transaction.findOne({
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("id")), "totalTransactions"],
        [Sequelize.fn("SUM", Sequelize.col("amount")), "totalAmount"],
        [Sequelize.fn("AVG", Sequelize.col("amount")), "averageAmount"],
        [Sequelize.fn("MAX", Sequelize.col("amount")), "maxAmount"],
        [Sequelize.fn("MIN", Sequelize.col("amount")), "minAmount"],
      ],
    });

    // console.log("Transaction summary:", summary);

    res.status(200).json(summary);
  } catch (error) {
    console.error("Error fetching transaction summary:", error);
    res.status(500).json({ error: "Error fetching transaction summary" });
  }
};

module.exports = {
  createTransaction,
  completeTransaction,
  getTransactionSummary,
  getAllTransactions,
  getFilteredTransactions,
  getTransactionsByDateRange,
  getUserTransactions,
};

// get all transactions in the system (maybe with pagination)
// filter transactions by type / status
// find transaction of a current user by his user_id
