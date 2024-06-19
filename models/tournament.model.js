module.exports = (sequelize, Sequelize) => {
  const Tournament = sequelize.define(
    "tournament",
    {
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      max_teams: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      entry_fees: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(
          "pending",
          "closed",
          "ongoing",
          "completed",
          "canceled"
        ),
        defaultValue: "pending",
        allowNull: false,
      },
      club_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      sport_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      winner_team_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    },

    {
      timestamps: false,
      indexes: [
        {
          fields: ["name", "club_id"],
        },
      ],
    }
  );
  return Tournament;
};
