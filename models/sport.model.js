module.exports = (sequelize, Sequelize) => {
  const Sport = sequelize.define(
    "sport",
    {
      name: {
        type: Sequelize.STRING,
      },
    },

    {
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["name"],
        },
      ],
    }
  );
  // // Define one-to-many relationship with Player
  // // Define one-to-many relationship with Team
  // // Define one-to-many relationship with Field
  // // Define one-to-many relationship with Tournament

  return Sport;
};
