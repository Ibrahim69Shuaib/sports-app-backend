require("dotenv").config();
const express = require("express");
//cors package
//helmet package
const db = require("./models");
const app = express();
const PORT = process.env.PORT || 3000;
require("./services/maintenanceScheduler");

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
require("./routes/field.routes")(app); // Field

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
