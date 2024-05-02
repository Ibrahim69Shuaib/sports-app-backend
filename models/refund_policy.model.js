module.exports = (sequelize, Sequelize) => {
  const RefundPolicy = sequelize.define(
    "RefundPolicy",
    {
      more_than_one_day: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },

      one_day_before: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },

      during_reservation: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );
  // Define one-to-many relationship with Player
  // Define one-to-many relationship with Team_Player

  return RefundPolicy;
};
