module.exports = (sequelize, Sequelize) => {
  const player_lineup = sequelize.define(
    "player_lineup",
    {
      jerseyNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      x: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false,
      },
      y: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false,
      },
      isCaptain: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: false,
    }
  );

  return player_lineup;
};
