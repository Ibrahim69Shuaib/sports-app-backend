const db = require("../models"); // Adjust the path as necessary to your models
const Team = db.team;
const Player = db.player;
const Club = db.club;
const MIN_QUERY_LENGTH = 3;
const MAX_QUERY_LENGTH = 10;
const MAX_RESULTS = 5;

async function GlobalSearch(req, res) {
  const { term } = req.query; // Assumes search term is passed as a query parameter

  if (!term) {
    return res.status(400).json({ message: "Search term is required" });
  }

  // Check query length before executing search
  if (term.length < MIN_QUERY_LENGTH || term.length > MAX_QUERY_LENGTH) {
    return res.status(400).json({
      message: `Search query length must be between ${MIN_QUERY_LENGTH} and ${MAX_QUERY_LENGTH} characters.`,
    });
  }

  const searchPattern = `%${term.toLowerCase()}%`; // Convert search term to lower case

  try {
    const [players, clubs, teams] = await Promise.all([
      Player.findAll({
        where: {
          name: db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("name")),
            "LIKE",
            searchPattern
          ),
        },
        limit: MAX_RESULTS,
      }),
      Club.findAll({
        where: {
          name: db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("name")),
            "LIKE",
            searchPattern
          ),
        },
        limit: MAX_RESULTS,
      }),
      Team.findAll({
        where: {
          name: db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("name")),
            "LIKE",
            searchPattern
          ),
        },
        limit: MAX_RESULTS,
      }),
    ]);

    // Add type attribute to each result
    const typedPlayers = players.map((player) => ({
      ...player.toJSON(),
      type: "player",
    }));
    const typedClubs = clubs.map((club) => ({
      ...club.toJSON(),
      type: "club",
    }));
    const typedTeams = teams.map((team) => ({
      ...team.toJSON(),
      type: "team",
    }));

    // Combine all results and send back to the client
    const combinedResults = [...typedPlayers, ...typedClubs, ...typedTeams];
    res.status(200).json(combinedResults);
  } catch (error) {
    console.error("Search error:", error);
    res
      .status(500)
      .json({ message: "Internal server error while performing search" });
  }
}

module.exports = { GlobalSearch };

// optimizations :
//1-Sanitize Inputs
//2-Query Length Limit (min-max) >> done
//3-Character Filtering
//4-Limit Results >> done
//5-use index on name attributes in tables
//6-Caching
//7-Autocomplete

// add an attribute like "type" that indicates whether the search result is a player , team or a club
