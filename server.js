require("dotenv").config();
const express = require("express");
//cors package
const db = require("./models");
const User = db.user;
const Role = db.role;
const app = express();
const PORT = process.env.PORT || 3000;

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

// Bulk insertion with error handling
// (async () => {
//   try {
//     const playerRole = await Role.findOne({ where: { name: "player" } });
//     const clubRole = await Role.findOne({ where: { name: "club" } });
//     const adminRole = await Role.findOne({ where: { name: "admin" } });

//     const users = [
//       {
//         username: "user23",
//         email: "user222@example.com",
//         password: "hashed_password1",
//         role_id: playerRole.id,
//       },
//       {
//         username: "user331",
//         email: "use213@example.com",
//         password: "hashed_password2",
//         role_id: clubRole.id,
//       },
//       {
//         username: "user213",
//         email: "user3321@example.com",
//         password: "hashed_password3",
//         role_id: adminRole.id,
//       },
//     ];

//     await User.bulkCreate(users);
//     console.log("Users created successfully!");
//   } catch (error) {
//     console.error("Error creating users:", error);
//   }
// })();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
