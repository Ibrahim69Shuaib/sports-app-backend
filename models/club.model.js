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
    },

    {
      timestamps: false,
    }
  );
  // Define one-to-one relationship with User

  return Club;
};
