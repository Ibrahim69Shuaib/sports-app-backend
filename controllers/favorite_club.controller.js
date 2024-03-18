const db = require("../models");
const FavoriteClub = db.favorite_club;
const Player = db.player;
const Club = db.club;
// Add club to favorites
const addToFavorites = async (req, res) => {
  try {
    const { playerId, clubId } = req.body;

    // Check if the club is already in favorites
    const existingFavorite = await FavoriteClub.findOne({
      where: { player_id: playerId, club_id: clubId },
    });

    if (existingFavorite) {
      return res.status(400).json({ message: "Club already in favorites" });
    }

    // Create a new favorite club entry
    await FavoriteClub.create({ player_id: playerId, club_id: clubId });

    res.status(201).json({ message: "Club added to favorites successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Remove club from favorites
// need a check that the same logged in user is the player in the req.body
const removeFromFavorites = async (req, res) => {
  try {
    const { playerId, clubId } = req.body;

    // Find and delete the favorite club entry
    const favorite = await FavoriteClub.findOne({
      where: { player_id: playerId, club_id: clubId },
    });

    if (!favorite) {
      return res.status(404).json({ message: "Club not found in favorites" });
    }

    await favorite.destroy();

    res
      .status(200)
      .json({ message: "Club removed from favorites successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Player's Favorite Clubs
const getPlayerFavoriteClubs = async (req, res) => {
  try {
    const playerId = req.params.playerId; // Assuming user information is available in req.user

    // Find player's favorite clubs
    const favoriteClubs = await FavoriteClub.findAll({
      where: { player_id: playerId },
      include: [{ model: Club, as: "club" }],
    });

    res.status(200).json(favoriteClubs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Club's Favored By Players
const getClubFavoredByPlayers = async (req, res) => {
  try {
    const clubId = req.params.clubId;

    // Find players who have Favored the club
    const FavoredPlayers = await FavoriteClub.findAll({
      where: { club_id: clubId },
      include: [{ model: Player, as: "player" }],
    });

    res.status(200).json(FavoredPlayers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getPlayerFavoriteClubs,
  getClubFavoredByPlayers,
};
