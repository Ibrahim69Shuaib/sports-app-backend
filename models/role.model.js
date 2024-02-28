module.exports = (sequelize, Sequelize) => {
  const Role = sequelize.define(
    "role",
    {
      name: {
        type: Sequelize.ENUM({ values: ["player", "club", "admin"] }),
        required: true,
        unique: true,
      },
    },
    { timestamps: false }
  );

  return Role;
};
