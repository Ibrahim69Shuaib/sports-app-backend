module.exports = (sequelize, Sequelize) => {
  const Duration = sequelize.define(
    "duration",
    {
      time: {
        type: Sequelize.TIME,
      },
    },
    {
      timestamps: false,
    }
  );

  return Duration;
};
