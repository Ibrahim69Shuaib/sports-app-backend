module.exports = (sequelize, Sequelize) => {
  const Post = sequelize.define(
    "post",
    {
      type: {
        type: Sequelize.ENUM("needPlayer", "needEnemyTeam"),
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("open", "closed"),
        defaultValue: "open",
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return Post;
};
