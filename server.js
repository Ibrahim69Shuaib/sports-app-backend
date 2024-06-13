require("dotenv").config();
const express = require("express");
const cors = require("cors");
//helmet package >> for improved security
const db = require("./models");
const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;
require("./services/maintenanceScheduler"); // field maintenance scheduler cron
require("./services/reservationScheduler"); // reservation status scheduler cron
require("./services/subscriptionScheduler"); // subscription recurring payment + status scheduler cron

async function initialize() {
  console.log(`Checking database connection...`);
  try {
    await db.sequelize.authenticate();
    console.log("Database connection OK!");
  } catch (error) {
    console.log("Unable to connect to the database:");
    console.log(error.message);
    process.exit(1);
  }
}

async function syncModels() {
  try {
    await db.sequelize.sync({ alter: true });
    console.log("Models synced successfully!");
  } catch (error) {
    console.error("Error syncing models:", error);
  }
}

initialize();
syncModels();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to the Sports App API");
});
// APIs routes
require("./routes/auth.routes")(app); // Auth
require("./routes/user.routes")(app); // User
require("./routes/role.routes")(app); // Role
require("./routes/permission.routes")(app); //Permission
require("./routes/player.routes")(app); //Player
require("./routes/sport.routes")(app); // Sport
require("./routes/position.routes")(app); // Position
require("./routes/follower.routes")(app); //Follower
require("./routes/club.routes")(app); // Club
require("./routes/club_follow.routes")(app); // Club_Follow TODO: NEEDS TESTING
require("./routes/field.routes")(app); // Field
require("./routes/duration.routes")(app); // Duration
require("./routes/team.routes")(app); // Team
require("./routes/request.routes")(app); // Request
require("./routes/stripe.routes")(app); // Stripe
require("./routes/wallet.routes")(app); // Wallet
require("./routes/transaction.routes")(app); // Transaction
require("./routes/player_lineup.routes")(app); // Lineup
require("./routes/reservation.routes")(app); // Reservation
require("./routes/search.routes")(app); // Search
require("./routes/utilities.routes")(app); // Utilities
require("./routes/club_rating.routes")(app); // Club-Rating
require("./routes/team_follow.routes")(app); // Team-Follow
require("./routes/posts.routes")(app); // Posts
require("./routes/plan.routes")(app); // Plans
require("./routes/subscription.routes")(app); // Subscriptions
// require("./routes/tournament.routes")(app); // Tournaments

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
