module.exports = (sequelize, Sequelize) => {
  const Permission = sequelize.define(
    "permission",
    {
      name: {
        type: Sequelize.STRING,
        required: true,
        unique: true,
      },
    },
    { timestamps: false }
  );
  // // Define many-to-many relationship with Permissions
  // // Permission.belongsToMany(Role, { through: RolePermission });
  return Permission;
};
