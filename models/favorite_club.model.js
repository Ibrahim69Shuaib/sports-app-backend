module.exports = (sequelize, Sequelize) => {
  const Favorite_Club = sequelize.define(
    "favorite_club",
    {
      date: {
        type: Sequelize.DATEONLY,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      timestamps: false,
    }
  );

  return Favorite_Club;
};
