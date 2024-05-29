module.exports = (sequelize, Sequelize) => {
  const Subscription = sequelize.define(
    "subscription",
    {
      startDate: {
        type: Sequelize.DATEONLY,
        required: true,
      },
      endDate: {
        type: Sequelize.DATEONLY,
        required: true,
      },
      status: {
        type: Sequelize.ENUM("active", "expired", "canceled"),
        required: true,
      },
    },
    {
      timestamps: false,
      indexes: [
        {
          fields: ["club_id"],
        },
      ],
    }
  );
  return Subscription;
};
