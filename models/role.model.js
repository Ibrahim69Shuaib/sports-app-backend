module.exports = (sequelize, Sequelize) => {
  const Role = sequelize.define(
    "role",
    {
      name: {
        type: Sequelize.ENUM({ values: ["player", "club", "admin"] }),
        required: true,
        // unique: true,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["name"],
        },
      ],
    }
  );

  return Role;
};
