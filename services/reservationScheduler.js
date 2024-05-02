const cron = require("node-cron");
const db = require("../models");
const { Op } = require("sequelize");
const Reservation = db.reservation;

// Function to update reservations
const updatePastIncompleteReservations = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to start of the day

  try {
    const updated = await Reservation.update(
      { status: "completed" },
      {
        where: {
          status: "incomplete",
          date: {
            [Op.lt]: today, // Matches dates before today
          },
        },
      }
    );

    console.log(`Updated ${updated} reservations to 'complete'`);
  } catch (error) {
    console.error("Error updating reservations:", error);
  }
};

// Schedule the task with timezone
cron.schedule("0 */12 * * *", updatePastIncompleteReservations, {
  scheduled: true,
  timezone: "Etc/GMT+3",
});

console.log("Scheduled a daily check for past incomplete reservations.");
