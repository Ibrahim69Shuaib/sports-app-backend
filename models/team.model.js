module.exports = (sequelize, Sequelize) => {
  const Team = sequelize.define(
    "team",
    {
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      pic: {
        type: Sequelize.STRING,
      },
      up_for_game: {
        type: Sequelize.BOOLEAN,
        default: false,
      },
      description: {
        type: Sequelize.STRING,
      },
      max_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 20,
        },
      },
      level: {
        type: Sequelize.ENUM("Excellent", "Intermediate", "Good", "Beginner"),
      },
    },
    {
      timestamps: true,
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ["name"],
        },
      ],
    }
  );

  return Team;
};
