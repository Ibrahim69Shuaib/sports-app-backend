const dbConfig = require("../config/database.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  // logging: (...msg) => console.log(msg),
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
// only models under this line will be synced with db
db.permission = require("./permission.model.js")(sequelize, Sequelize);
db.role = require("./role.model.js")(sequelize, Sequelize);
db.user = require("./user.model.js")(sequelize, Sequelize);
// db.position = require("./position.model.js")(sequelize, Sequelize);
// db.sport = require("./sport.model.js")(sequelize, Sequelize);
// db.player = require("./player.model.js")(sequelize, Sequelize);
// db.club = require("./club.model.js")(sequelize, Sequelize);

//RelationShips =>

//user - role relationship
db.user.belongsTo(db.role, { foreignKey: "role_id" });
db.role.hasMany(db.user, { foreignKey: "role_id" });

//role - permission relationship
db.role.belongsToMany(db.permission, {
  through: "role_permission",
  foreignKey: "role_id",
  timestamps: false,
});
db.permission.belongsToMany(db.role, {
  through: "role_permission",
  foreignKey: "permission_id",
  timestamps: false,
});

//user - player relationship
//player belongs to user
//user has one player
//-------------------------
//user - club relationship
//player - sports relationship
//player - sports relationship
//player - positions relationship

module.exports = db;
