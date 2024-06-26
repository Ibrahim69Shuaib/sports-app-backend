module.exports = (sequelize, Sequelize) => {
  const Token = sequelize.define(
    "token",
    {
      email_token: {
        type: Sequelize.STRING,
      },
      notification_player_id: {
        type: Sequelize.STRING,
      },
      password_token: {
        type: Sequelize.STRING,
      },
    },

    {
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["user_id"],
        },
      ],
    }
  );
  // one to one relationship with user
  return Token;
};
