module.exports = (sequelize, Sequelize) => {
  const Reservation = sequelize.define(
    "reservation",
    {
      type: {
        type: Sequelize.ENUM("player", "team", "club"),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("incomplete", "completed", "canceled"), //TODO: use upcoming instead of incomplete|if refunded status = > canceled
        allowNull: false,
        defaultValue: "incomplete",
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      is_refunded: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      updatedAt: false,
    }
  );
  return Reservation;
};
// user_id fk , duration id fk
