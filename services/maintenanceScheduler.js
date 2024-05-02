const cron = require("node-cron");
const db = require("../models");
const Field = db.field;

// Define the cron job to run daily at midnight
cron.schedule(
  "0 */12 * * *", // every day
  // "* * * * *", every minute
  async () => {
    try {
      // Query fields that are currently under maintenance
      const fieldsUnderMaintenance = await Field.findAll({
        where: { isUnderMaintenance: true },
      });

      // Iterate over the fields
      for (const field of fieldsUnderMaintenance) {
        // Check if the end_date has passed
        if (field.end_date <= new Date()) {
          // Update the field's maintenance status to false and remove start_date and end_date
          await Field.update(
            { isUnderMaintenance: false, start_date: null, end_date: null },
            { where: { id: field.id } }
          );
        }
      }
    } catch (error) {
      console.error("Error in maintenance scheduler:", error);
    }
  },
  {
    timezone: "Etc/GMT+3", // Adjust the timezone as needed or local time zone
  }
);
