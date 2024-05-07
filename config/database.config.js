require("dotenv").config();
module.exports = {
  HOST: process.env.HOST,
  USER: process.env.USER_NAME,
  PASSWORD: process.env.PASSWORD,
  DB: process.env.DATABASE,
  dialect: process.env.DIALECT,
  port: process.env.DBPORT,
  // pool: {
  //   max: 5,
  //   min: 0,
  //   acquire: 30000,
  //   idle: 10000
  // }
};
