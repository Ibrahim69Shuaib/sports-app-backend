module.exports = (sequelize, Sequelize) => {
  const follow_club = sequelize.define(
    "follow_club",
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
  return follow_club;
};
