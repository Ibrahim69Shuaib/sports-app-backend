module.exports = (sequelize, Sequelize) => {
  const Notifications = sequelize.define(
    "notifications",
    {
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING, // change it to ENUM
        allowNull: false,
      },
      message: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      link: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );

  return Notifications;
};
