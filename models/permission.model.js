module.exports = (sequelize, Sequelize) => {
  const Permission = sequelize.define(
    "permission",
    {
      name: {
        type: Sequelize.STRING,
        required: true,
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
  // // Define many-to-many relationship with Permissions
  // // Permission.belongsToMany(Role, { through: RolePermission });
  return Permission;
};
