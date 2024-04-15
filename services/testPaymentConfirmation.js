const dotenv = require("dotenv");
dotenv.config();
// console.log("stripe secret ", process.env.STRIPE_PUBLISHABLE_KEY);
const stripe = require("stripe")("Stripe_Secret_Key"); // replace with real api key

// Manually confirm a payment
async function confirmPayment(paymentIntentId) {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: "pm_card_visa", // Test card number
      return_url: "http://localhost:4000",
    });
    return paymentIntent;
  } catch (error) {
    console.error("Error confirming payment:", error);
    throw error;
  }
}

// Usage example
const paymentIntentId = "PaymentIntentId"; // replace with real PaymentIntentId
confirmPayment(paymentIntentId)
  .then((paymentIntent) => {
    console.log("Payment confirmed successfully:", paymentIntent);
  })
  .catch((error) => {
    console.error("Failed to confirm payment:", error);
  });
