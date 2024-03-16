module.exports = (sequelize, Sequelize) => {
  const Club = sequelize.define(
    "club",
    {
      name: {
        type: Sequelize.STRING,
      },

      description: {
        type: Sequelize.STRING,
      },

      location: {
        type: Sequelize.STRING,
      },

      pic: {
        type: Sequelize.STRING,
      },

      isBlocked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      lat: {
        type: Sequelize.DECIMAL(10, 8),
        validate: {
          // range from -90 to +90
          min: -90,
          max: 90,
        },
      },
      lon: {
        type: Sequelize.DECIMAL(11, 8),
        validate: {
          // range from -180 to +180
          min: -180,
          max: 180,
        },
      },
    },

    {
      timestamps: false,
    }
  );
  // Define one-to-one relationship with User

  return Club;
};
