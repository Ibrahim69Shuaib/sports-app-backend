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
db.token = require("./token.model.js")(sequelize, Sequelize);
db.position = require("./position.model.js")(sequelize, Sequelize);
db.sport = require("./sport.model.js")(sequelize, Sequelize);
db.player = require("./player.model.js")(sequelize, Sequelize);
// db.club = require("./club.model.js")(sequelize, Sequelize);

//RelationShips =>

//user - role relationship (one to many)
db.user.belongsTo(db.role, { foreignKey: "role_id" });
db.role.hasMany(db.user, { foreignKey: "role_id" });
//-----------------------------------------------------
//role - permission relationship (many to many)
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
//-----------------------------------------------------
//user - token relationship (one to one)
db.user.hasOne(db.token, {
  foreignKey: "user_id",
});

db.token.belongsTo(db.user, {
  foreignKey: "user_id",
});
//-----------------------------------------------------
//user - player relationship (one to one)
db.user.hasOne(db.player, { foreignKey: "user_id" });
db.player.belongsTo(db.user, { foreignKey: "user_id" });
//-----------------------------------------------------
//player - sports relationship
db.sport.hasMany(db.player, { foreignKey: "sport_id" });
db.player.belongsTo(db.sport, { foreignKey: "sport_id" });
//-----------------------------------------------------
//player - positions relationship (one to many)
db.position.hasMany(db.player, { foreignKey: "position_id" });
db.player.belongsTo(db.position, { foreignKey: "position_id" });
//-----------------------------------------------------
//sport - position relationship (many to many)
db.sport.belongsToMany(db.position, {
  through: "sport_position",
  timestamps: false,
});
db.position.belongsToMany(db.sport, {
  through: "sport_position",
  timestamps: false,
});
//-----------------------------------------------------
//user - club relationship

//-----------------------------------------------------
module.exports = db;
