module.exports = (sequelize, Sequelize) => {
  const Request = sequelize.define(
    "request",
    {
      type: {
        type: Sequelize.ENUM(
          "joinTeam",
          "inviteToTeam",
          "joinTournament",
          "joinPost",
          "enemyTeam"
        ),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("pending", "accepted", "declined"),
        allowNull: false,
        defaultValue: "pending",
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      updatedAt: false,
    }
  );
  return Request;
};
