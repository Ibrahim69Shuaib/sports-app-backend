// get current logged in user wallet
const db = require("../models");
const Wallet = db.wallet;

// Get the wallet of the currently logged-in user
const getLoggedInUserWallet = async (req, res) => {
  const userId = req.user.id; // Assuming you have middleware to get user info

  try {
    const wallet = await Wallet.findOne({ where: { user_id: userId } });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    res.status(200).json({ wallet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving wallet" });
  }
};

module.exports = {
  getLoggedInUserWallet,
};
