module.exports = (sequelize, Sequelize) => {
  const Plan = sequelize.define(
    "plan",
    {
      name: {
        type: Sequelize.STRING,
        required: true,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        required: true,
      },
      duration: {
        type: Sequelize.INTEGER,
        required: true,
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
  return Plan;
};
