module.exports = (sequelize, Sequelize) => {
  const Utilities = sequelize.define(
    "utilities",
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
  // one to one relationship with user
  return Utilities;
};
