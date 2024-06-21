const db = require("../models");
const Field = db.field;
const Club = db.club;
const getRandomAds = async (req, res) => {
  try {
    // Fetch random fields
    const randomFields = await Field.findAll({
      attributes: ["id", "pic"],
      order: db.sequelize.random(),
      limit: 5, // You can adjust the limit as needed
    });

    // Fetch random clubs
    const randomClubs = await Club.findAll({
      attributes: ["id", "pic"],
      order: db.sequelize.random(),
      limit: 5, // You can adjust the limit as needed
    });

    // Format the results
    const ads = [
      ...randomFields.map((field) => ({
        id: field.id,
        pic: field.pic,
        type: "field",
      })),
      ...randomClubs.map((club) => ({
        id: club.id,
        pic: club.pic,
        type: "club",
      })),
    ];

    res.status(200).json(ads);
  } catch (error) {
    console.error("Error fetching ads:", error);
    res.status(500).json({ message: "Failed to fetch ads" });
  }
};

module.exports = { getRandomAds };
