// const { Sequelize, DataTypes } = require("sequelize");
// const sequelize = require("../config/database");
// const bcrypt = require("bcryptjs");
// const Role = require("./Role");
// const User = sequelize.define(
//   "User",
//   {
//     username: {
//       type: DataTypes.STRING,
//       required: true,
//       unique: true,
//     },
//     email: {
//       type: DataTypes.STRING,
//       required: true,
//       unique: true,
//     },
//     password: {
//       type: DataTypes.STRING,
//       required: true,
//     },
//     phone_number: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     role_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: "Role",
//         key: "id",
//       },
//     },
//   },
//   { timestamps: true }
// );
// console.log(User === sequelize.models.User);
// const jane = await User.create({ username: "Jane" });
// console.log(jane.toJSON());
// // User.beforeCreate = async (user, options) => {
// //   const salt = await bcrypt.genSalt(10);
// //   user.password = await bcrypt.hash(user.password, salt);
// // };

// // Define one-to-many relationship with Role model
// User.belongsTo(Role, { foreignKey: "role_id" });

// module.exports = User;

module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define(
    "user",
    {
      username: {
        type: Sequelize.STRING,
        required: true,
        unique: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        required: true,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        required: true,
        allowNull: false,
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    { timestamps: true, paranoid: true }
  );
  // Define one-to-many relationship with Role model
  // User.belongsTo(Role, { foreignKey: "role_id" });
  return User;
};
