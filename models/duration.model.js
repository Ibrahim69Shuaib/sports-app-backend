module.exports = (sequelize, Sequelize) => {
  const Duration = sequelize.define(
    "duration",
    {
      time: {
        type: Sequelize.DATE,
      },
      is_available: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      timestamps: false,
    }
  );

  return Duration;
};
