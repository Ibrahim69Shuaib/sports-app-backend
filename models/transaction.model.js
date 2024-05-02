module.exports = (sequelize, Sequelize) => {
  const Transaction = sequelize.define(
    "transaction",
    {
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM(
          "wallet_funding",
          "wallet_transfer",
          "subscription_payment",
          "refund"
        ),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("pending", "completed", "failed"),
        allowNull: false,
        defaultValue: "pending",
      },
      paymentIntentId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
    }
  );

  return Transaction;
};
