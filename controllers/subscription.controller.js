const db = require("../models");
const { Op } = require("sequelize");
const Decimal = require("decimal.js");
const Subscription = db.subscription;
const Wallet = db.wallet;
const Plan = db.plan;
const Club = db.club;
const Transaction = db.transaction;
const User = db.user;
// Subscribe to Plan
async function subscribeToPlan(req, res) {
  const userId = req.user.id;
  const { planId } = req.body;

  const transaction = await db.sequelize.transaction();

  try {
    const club = await Club.findOne({
      where: { user_id: userId },
      transaction,
    });
    if (!club) {
      throw new Error("Club not found");
    }

    const plan = await Plan.findByPk(planId, { transaction });
    if (!plan) {
      throw new Error("Plan not found");
    }

    const activeSubscription = await Subscription.findOne({
      where: {
        club_id: club.id,
        status: "active",
      },
      transaction,
    });

    if (activeSubscription) {
      throw new Error("Club already has an active subscription");
    }

    const clubWallet = await Wallet.findOne({
      where: { user_id: userId },
      transaction,
    });
    if (!clubWallet) {
      throw new Error("Club wallet not found");
    }
    const planPrice = new Decimal(plan.price);
    const clubBalance = new Decimal(clubWallet.balance);

    if (clubBalance.lessThan(planPrice)) {
      throw new Error("Insufficient funds");
    }

    // Deduct from club wallet
    clubWallet.balance = clubBalance.minus(planPrice).toFixed(2);
    await clubWallet.save({ transaction });

    // Add to admin wallet
    const adminUser = await User.findOne({
      where: { role_id: 3 },
      transaction,
    });
    if (!adminUser) {
      throw new Error("admin user not found");
    }
    const adminWallet = await Wallet.findOne({
      where: { user_id: adminUser.id },
      transaction,
    });
    if (!adminWallet) {
      throw new Error("admin wallet not found");
    }
    const adminBalance = new Decimal(adminWallet.balance);
    adminWallet.balance = adminBalance.plus(planPrice).toFixed(2);
    await adminWallet.save({ transaction });

    // Create subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.duration);

    const subscription = await Subscription.create(
      {
        club_id: club.id,
        planId,
        startDate,
        endDate,
        status: "active",
        plan_id: plan.id,
      },
      { transaction }
    );

    // Create transaction record
    await Transaction.create(
      {
        user_id: userId,
        amount: planPrice.toFixed(2),
        type: "subscription_payment",
        status: "completed",
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json(subscription);
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({
      message: error.message,
      error: "Failed to create subscription due to an internal error.",
    });
  }
}
async function cancelSubscription(req, res) {
  const userId = req.user.id;

  const transaction = await db.sequelize.transaction();

  try {
    const club = await Club.findOne({
      where: { user_id: userId },
      transaction,
    });
    if (!club) {
      throw new Error("Club not found");
    }

    const activeSubscription = await Subscription.findOne({
      where: {
        club_id: club.id,
        status: "active",
      },
      transaction,
    });

    if (!activeSubscription) {
      throw new Error("No active subscription found");
    }

    activeSubscription.status = "canceled";
    await activeSubscription.save({ transaction });

    await transaction.commit();
    res.status(200).json({ message: "Subscription canceled successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({
      message: error.message,
      error: "Failed to cancel subscription due to an internal server error",
    });
  }
}
// Get Current Active Subscription and Plan
async function getCurrentActiveSubscription(req, res) {
  const userId = req.user.id;

  try {
    const club = await Club.findOne({ where: { user_id: userId } });
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    const activeSubscription = await Subscription.findOne({
      where: {
        club_id: club.id,
        status: "active",
      },
      include: [Plan],
    });

    if (!activeSubscription) {
      return res.status(404).json({ message: "No active subscription found" });
    }

    res.status(200).json(activeSubscription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching active subscription" });
  }
}
// Get All Subscriptions
async function getAllSubscriptions(req, res) {
  const userId = req.user.id;

  try {
    const club = await Club.findOne({ where: { user_id: userId } });
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    const subscriptions = await Subscription.findAll({
      where: { club_id: club.id },
      include: [Plan],
    });

    res.status(200).json(subscriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching subscriptions" });
  }
}
// Get Subscription Statistics for Admin
async function getSubscriptionStatistics(req, res) {
  try {
    const totalSubscriptions = await Subscription.count();
    const activeSubscriptions = await Subscription.count({
      where: { status: "active" },
    });

    const revenue = await Subscription.sum("price", {
      include: {
        model: Plan,
        attributes: [],
      },
    });

    res.status(200).json({
      totalSubscriptions,
      activeSubscriptions,
      revenue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching subscription statistics" });
  }
}
// check if there is an active subscription for current club (return true / false)
const activeSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const club = await Club.findOne({ where: { user_id: userId } });
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }
    const activeSubscription = await Subscription.findOne({
      where: {
        club_id: club.id,
        status: "active",
      },
    });

    if (activeSubscription) {
      return res.status(200).json({ ActiveSubscription: true });
    } else {
      return res.status(200).json({ ActiveSubscription: false });
    }
  } catch (error) {}
};
module.exports = {
  subscribeToPlan,
  cancelSubscription,
  getSubscriptionStatistics,
  getAllSubscriptions,
  getCurrentActiveSubscription,
  activeSubscription,
};
