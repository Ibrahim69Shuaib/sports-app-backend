module.exports = (sequelize, Sequelize) => {
  const Club = sequelize.define(
    "club",
    {
      clubname: {
        type: Sequelize.STRING,
      },
    },
    {
      description: {
        type: Sequelize.STRING,
      },
    },
    {
      location: {
        type: Sequelize.STRING,
      },
    },
    {
      pic: {
        type: Sequelize.STRING,
      },
    },
    {
      isBlocked: {
        type: Sequelize.BOOLEAN,
      },
    },

    {
      timestamps: false,
    }
  );
  // Define one-to-one relationship with User

  return Club;
};
