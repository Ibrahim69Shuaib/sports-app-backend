module.exports = (app) => {
  var router = require("express").Router();
  const { verifyToken } = require("../middleware/auth.middleware.js");
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const Transaction = require("../models/transaction.model");
  const {
    createTransaction,
  } = require("../controllers/transaction.controller.js");
  const {
    completeTransaction,
  } = require("../controllers/transaction.controller.js");
  // Route to handle payment requests
  router.post("/initiate-payment", verifyToken, async (req, res) => {
    const { amount } = req.body;
    const userId = req.user.id;
    try {
      // Create a payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Amount in cents
        currency: "usd",
      });

      // Create a transaction record in your database
      const transaction = await createTransaction(
        amount,
        "wallet_funding",
        paymentIntent.id,
        userId
      );

      // Send the payment intent client secret back to the frontend
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  // Route to confirm payment and complete transaction
  router.post("/confirm-payment", verifyToken, async (req, res) => {
    const { paymentIntentId, amount } = req.body;
    const userId = req.user.id;
    try {
      // Retrieve payment intent details from Stripe to verify payment
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      // Check if payment was successful
      console.log(paymentIntent.status);
      if (paymentIntent.status === "succeeded") {
        // Complete the transaction and add funds to user's wallet
        await completeTransaction(paymentIntentId, userId, amount);
        res.json({
          message: "Payment confirmed and transaction completed successfully",
        });
      } else {
        // Handle unsuccessful payment
        res.status(400).json({ error: "Payment confirmation failed" });
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  app.use("/api/stripe", router);
};
