module.exports = (sequelize, Sequelize) => {
  const Follower = sequelize.define(
    "follower",
    {
      status: {
        type: Sequelize.ENUM("active", "blocked"),
        defaultValue: "active",
      },
      date: {
        type: Sequelize.DATEONLY,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      timestamps: false,
      primaryKey: false,
    }
  );

  return Follower;
};
