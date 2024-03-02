module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define(
    "user",
    {
      username: {
        type: Sequelize.STRING,
        required: true,
        // unique: true,
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
        required: true,
        allowNull: false,
      },
      //isVerified is set to default false once a user signs up
      //this will change later after email has been verified
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ["username"],
        },
      ],
    }
  );
  //because of a bug in Sequelize i had to create unique index for every field that has to be unique and cant use the unique option
  //because it would cause duplicated indexes for the same field when using sync with alter true option
  // Define one-to-many relationship with Role model
  // User.belongsTo(Role, { foreignKey: "role_id" });
  return User;
};
