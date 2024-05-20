module.exports = (sequelize, Sequelize) => {
  const team_follow = sequelize.define(
    "team_follow",
    {
      followedAt: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      timestamps: false,
    }
  );
  return team_follow;
};
