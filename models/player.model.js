module.exports = (sequelize, Sequelize) => {
  const Player = sequelize.define(
    "player",
    {
      available: {
        type: Sequelize.BOOLEAN,
      },
    },
    {
      pic: {
        type: Sequelize.STRING,
      },
    },
    {
      location: {
        type: Sequelize.STRING,
      },
    },
    {
      timestamps: false,
    }
  );
  // Define one-to-one relationship with User
  // Define one-to-many relationship with Position
  // Define one-to-many relationship with Sport

  return Player;
};
