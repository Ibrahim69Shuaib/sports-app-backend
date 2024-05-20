module.exports = (sequelize, Sequelize) => {
  const ClubRating = sequelize.define(
    "club_rating",
    {
      rating_value: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5, // because we are creating a 5-star rating system
        },
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    },

    {
      timestamps: false,
    }
  );

  return ClubRating;
};
