module.exports = (sequelize, Sequelize) => {
  const Position = sequelize.define(
    "position",
    {
      name: {
        type: Sequelize.STRING,
      },

      key: {
        type: Sequelize.STRING,
      },
    },
    {
      timestamps: false,
    }
  );
  // Define one-to-many relationship with Player
  // Define one-to-many relationship with Team_Player

  return Position;
};
