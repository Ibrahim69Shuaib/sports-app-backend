module.exports = (sequelize, Sequelize) => {
  const Player = sequelize.define(
    "player",
    {
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        required: true,
      },
      available: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      pic: {
        type: Sequelize.STRING,
      },

      location: {
        type: Sequelize.STRING,
      },
    },
    {
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["user_id"],
        },
      ],
    }
  );
  // Define one-to-one relationship with User
  // Define one-to-many relationship with Position
  // Define one-to-many relationship with Sport

  return Player;
};
