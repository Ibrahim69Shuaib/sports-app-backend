module.exports = (sequelize, Sequelize) => {
  const Wallet = sequelize.define(
    "wallet",
    {
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true, // could cause an error "duplicated unique indexes" (if so manually create a unique index)
      },
      balance: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },

      frozenBalance: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      timestamps: true,
      createdAt: false,
      paranoid: true,
      //   indexes: [
      //     {
      //       unique: true,
      //       fields: ["user_id"],
      //     },
      //   ],
    }
  );

  return Wallet;
};
