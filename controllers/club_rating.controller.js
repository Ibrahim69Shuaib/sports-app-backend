const db = require("../models");
const ClubRating = db.club_rating;
const Club = db.club;
const Player = db.player;
// Function to add or update a rating
//TODO: might need validation to the player making the rating + find the player if it exists
async function addOrUpdateRating(req, res) {
  const { player_id, club_id, rating_value } = req.body;

  try {
    let rating = await ClubRating.findOne({
      where: {
        player_id: player_id,
        club_id: club_id,
      },
    });

    if (rating) {
      // Update existing rating
      rating.rating_value = rating_value;
      await rating.save();
      res.status(200).send({ message: "Rating updated successfully." });
    } else {
      // Create new rating
      await ClubRating.create({
        player_id,
        club_id,
        rating_value,
      });
      res.status(201).send({ message: "Rating added successfully." });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error updating or adding rating",
      error: error.message,
    });
  }
}

// Function to get the average rating for a club
async function getAverageRating(req, res) {
  const { club_id } = req.params;

  try {
    const ratings = await ClubRating.findAll({
      where: { club_id: club_id },
    });

    const average =
      ratings.reduce((acc, curr) => acc + curr.rating_value, 0) /
      ratings.length;
    res.status(200).send({ average: average.toFixed(2) }); // Returns the average rounded to two decimal places
  } catch (error) {
    res.status(500).send({ message: "Error retrieving average rating" });
  }
}

// Function to get all ratings by a player
async function getRatingsByPlayer(req, res) {
  const { player_id } = req.params;

  try {
    const ratings = await ClubRating.findAll({
      where: { player_id: player_id },
    });
    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving player's ratings" });
  }
}

async function getCurrentRating(req, res) {
  const userId = req.user.id;
  const { clubId } = req.params;
  try {
    const player = await Player.findOne({ where: { user_id: userId } });
    if (!player) res.status(404).send({ message: "Player not found" });
    const club = await Club.findByPk(clubId);
    if (!club) {
      res.status(404).send({ message: "Club not found" });
    }
    const rating = await ClubRating.findOne({
      where: { club_id: club.id, player_id: player.id },
    });
    if (rating) {
      res.status(200).json(rating);
    } else {
      res.status(200).json({ rate: false });
    }
  } catch (error) {
    res.status(500).send({ message: "Error retrieving player's ratings" });
  }
}
//FIXME: not working
// async function listTopRatedClubs(req, res) {
//   try {
//     const clubs = await Club.findAll({
//       include: [
//         {
//           model: ClubRating,
//           attributes: [], // No attributes from ClubRating needed directly
//         },
//       ],
//       attributes: [
//         "id",
//         "name", // Ensure you're using the correct attribute names as they are defined in your Club model
//         [
//           db.Sequelize.fn("AVG", db.Sequelize.col("club_ratings.rating_value")),
//           "averageRating",
//         ],
//       ],
//       group: ["Club.id"], // Refer to the primary key by including the model name when grouped
//       order: [[db.Sequelize.col("averageRating"), "DESC"]],
//       logging: console.log, // Outputs the executed SQL to the console
//     });

//     // To handle potential null values and convert them to a readable format
//     const result = clubs.map((club) => ({
//       ...club.get({ plain: true }),
//       averageRating: club.dataValues.averageRating
//         ? parseFloat(club.dataValues.averageRating).toFixed(2)
//         : "Not Rated",
//     }));

//     res.status(200).json(result);
//   } catch (error) {
//     console.error("Error listing top rated clubs:", error);
//     res.status(500).send({ message: "Error listing top rated clubs" });
//   }
// }

module.exports = {
  addOrUpdateRating,
  getAverageRating,
  getRatingsByPlayer,
  getCurrentRating,
  //   listTopRatedClubs,
};
