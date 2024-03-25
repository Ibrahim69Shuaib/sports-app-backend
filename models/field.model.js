module.exports = (sequelize, Sequelize) => {
  const Fields = sequelize.define(
    "field",
    {
      size: {
        type: Sequelize.INTEGER,
        required: true,
        allowNull: false,
      },
      pic: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.STRING,
      },
      duration: {
        type: Sequelize.DECIMAL(4, 2), // like 1.5
        required: true,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2), // 8 total numerical digits like 12345678.90
        required: true,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM("Natural", "Hybrid", "Tartan"),
        defaultValue: "Tartan",
      },
      isUnderMaintenance: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      start_date: {
        type: Sequelize.DATEONLY,
      },
      end_date: {
        type: Sequelize.DATEONLY,
      },
    },
    {
      timestamps: false,
    }
  );

  return Fields;
};
