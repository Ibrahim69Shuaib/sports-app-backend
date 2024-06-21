module.exports = (sequelize, Sequelize) => {
  const TournamentTeam = sequelize.define(
    "tournamentteam",
    {
      status: {
        type: Sequelize.ENUM("active", "eliminated"),
        defaultValue: "active",
      },
    },

    {
      timestamps: false,
      indexes: [
        {
          fields: ["team_id", "tournament_id"],
        },
      ],
    }
  );
  return TournamentTeam;
};
