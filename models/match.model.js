module.exports = (sequelize, Sequelize) => {
  const Match = sequelize.define(
    "match",
    {
      date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      winner_team_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("pending", "scheduled", "completed"),
        defaultValue: "scheduled",
      },
      first_team_id: {
        type: Sequelize.INTEGER,
        allowNull: false, // might be true
      },
      second_team_id: {
        type: Sequelize.INTEGER,
        allowNull: false, // might be true
      },
      duration_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      tournament_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      round: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },

    {
      timestamps: false,
      indexes: [
        {
          fields: [
            "first_team_id",
            "second_team_id",
            "tournament_id",
            "duration_id",
          ],
        },
      ],
    }
  );
  return Match;
};
