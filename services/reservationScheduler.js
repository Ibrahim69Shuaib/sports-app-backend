const cron = require("node-cron");
const db = require("../models");
const { Op } = require("sequelize");
const Decimal = require("decimal.js");
const Reservation = db.reservation;
const Duration = db.duration;
const Field = db.field;
const Club = db.club;
const User = db.user;
const Wallet = db.wallet;
const updatePastIncompleteReservations = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to start of the day

  const transaction = await db.sequelize.transaction(); // Start a transaction

  try {
    // Find and update reservations that need to be completed and transfer funds from club's frozen balance to his regular balance
    const reservations = await Reservation.findAll({
      where: {
        status: "incomplete",
        date: { [Op.lt]: today },
      },
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
                      model: User,
                      include: [Wallet], // Now accessing Wallet through User
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      transaction,
    });

    for (const reservation of reservations) {
      // Update reservation status to completed
      reservation.status = "completed";
      await reservation.save({ transaction });

      // Process wallet transfer
      const userWallet = reservation.duration.field.club.user.wallet;
      const priceDecimal = new Decimal(reservation.duration.field.price);
      const frozenBalanceDecimal = new Decimal(userWallet.frozenBalance);
      const regularBalanceDecimal = new Decimal(userWallet.balance);

      // Calculate new balances
      userWallet.frozenBalance = frozenBalanceDecimal
        .minus(priceDecimal)
        .toFixed(2);
      userWallet.balance = regularBalanceDecimal.plus(priceDecimal).toFixed(2);

      // Save updated wallet balances
      await userWallet.save({ transaction });
    }

    // Commit the transaction
    await transaction.commit();
    console.log(
      `Updated and processed ${reservations.length} reservations to 'complete'`
    );
  } catch (error) {
    console.error("Error updating reservations with cron function:", error);
    await transaction.rollback(); // Rollback the transaction
  }
};

// Schedule the task with timezone
// cron.schedule("* * * * *", updatePastIncompleteReservations, {     >> for testing to work every minute
cron.schedule("0 */12 * * *", updatePastIncompleteReservations, {
  scheduled: true,
  timezone: "Etc/GMT+3",
});

console.log("Scheduled a daily check for past incomplete reservations.");
