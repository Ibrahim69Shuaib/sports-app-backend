// middleware/checkSubscription.js
const db = require("../models");
const Subscription = db.subscription;
const Club = db.club;

async function checkSubscription(req, res, next) {
  const userId = req.user.id;

  try {
    // Find the club associated with the user
    const club = await Club.findOne({ where: { user_id: userId } });
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    // Find an active subscription for the club
    const activeSubscription = await Subscription.findOne({
      where: {
        club_id: club.id,
        status: "active",
      },
    });

    // If there is no active subscription, deny access
    if (!activeSubscription) {
      return res
        .status(403)
        .json({ message: "No active subscription found. Access denied." });
    }

    // If there is an active subscription, proceed to the next middleware/route handler
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error checking subscription", error });
  }
}

module.exports = { checkSubscription };
