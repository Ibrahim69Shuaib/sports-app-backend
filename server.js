require("dotenv").config();
const express = require("express");
//cors package
//helmet package
const db = require("./models");
const app = express();
const PORT = process.env.PORT || 3000;
const checkRolesMiddleware = require("./middleware/check_roles.middleware");
const { verifyToken } = require("./middleware/auth.middleware");

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

require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);
require("./routes/role.routes")(app);
require("./routes/permission.routes")(app);
require("./routes/player.routes")(app);
require("./routes/sport.routes")(app);
require("./routes/position.routes")(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
