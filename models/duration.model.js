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
      indexes: [
        {
          unique: true,
          fields: ["field_id", "time"],
        },
      ],
    }
  );

  return Duration;
};
