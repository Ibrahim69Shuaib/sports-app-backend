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
db.follower = require("./follower.model.js")(sequelize, Sequelize);
db.club = require("./club.model.js")(sequelize, Sequelize);
db.field = require("./field.model.js")(sequelize, Sequelize);
db.duration = require("./duration.model.js")(sequelize, Sequelize);
db.team = require("./team.model.js")(sequelize, Sequelize);
db.request = require("./request.model.js")(sequelize, Sequelize);
//db.notification= require("./notification..model.js")(sequelize, Sequelize);
db.favorite_club = require("./favorite_club.model.js")(sequelize, Sequelize);
//db.plan= require ("./plan.model.js")(sequelize, Sequelize);
//db.subscription= require ("./subscription.model.js")(sequelize,Sequelize);

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
// user - notification relationship (one to many)
// db.user.hasMany(db.notification,{foreignKey:"user_id"})
// db.notification.belongsTo(db.user,{foreignKey:"user_id"})
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
// player - follower relationship (many to many) the follow model act as join table between the player model and itself
db.player.belongsToMany(db.player, {
  through: db.follower,
  as: "followers",
  foreignKey: "player_id",
  otherKey: "follower_id",
});
db.follower.belongsTo(db.player, { foreignKey: "player_id", as: "player" }); // this line is sus
//-----------------------------------------------------
//player - favorite_club relationship (one to many)
db.player.hasMany(db.favorite_club, { foreignKey: "player_id" });
db.favorite_club.belongsTo(db.player, { foreignKey: "player_id" });
//-----------------------------------------------------
// club - favorite_club relationship (one to many)
db.club.hasMany(db.favorite_club, { foreignKey: "club_id" });
db.favorite_club.belongsTo(db.club, { foreignKey: "club_id" });
//-----------------------------------------------------
//user - club relationship
db.user.hasOne(db.club, { foreignKey: "user_id" });
db.club.belongsTo(db.user, { foreignKey: "user_id" });
//-----------------------------------------------------
//club - field relationship (one to many)
db.club.hasMany(db.field, { foreignKey: "club_id" });
db.field.belongsTo(db.club, { foreignKey: "club_id" });
//-----------------------------------------------------
//field - sport relationship (one to many)
db.sport.hasMany(db.field, { foreignKey: "sport_id" });
db.field.belongsTo(db.sport, { foreignKey: "sport_id" });
//-----------------------------------------------------
// field - duration relationship (one to many)
db.field.hasMany(db.duration, { foreignKey: "field_id" });
db.duration.belongsTo(db.field, { foreignKey: "field_id" });
//-----------------------------------------------------
//team - player relationship (one to many)
db.player.belongsTo(db.team, { foreignKey: "team_id" });
db.team.hasMany(db.player, { foreignKey: "team_id" });
db.player.hasOne(db.team, { foreignKey: "captain_id", as: "captainTeam" }); // player id of the team captain
//-----------------------------------------------------
//team - sport relationship (one to many)
db.team.belongsTo(db.sport, { foreignKey: "sport_id" });
db.sport.hasMany(db.team, { foreignKey: "sport_id" });
//-----------------------------------------------------
//request - user relationship (one to many)
db.user.hasMany(db.request, { foreignKey: "sender_id", as: "sentRequests" });
db.user.hasMany(db.request, {
  foreignKey: "receiver_id",
  as: "receivedRequests",
});
db.request.belongsTo(db.user, { foreignKey: "sender_id", as: "sender" });
db.request.belongsTo(db.user, { foreignKey: "receiver_id", as: "receiver" });
//-----------------------------------------------------
//request - team relationship (one to many)
db.team.hasMany(db.request, { foreignKey: "team_id", as: "sentRequests" });
db.request.belongsTo(db.team, { foreignKey: "team_id", as: "team" });
//-----------------------------------------------------
//request - post relationship (one to many)
// db.post.hasMany(db.request, { foreignKey: 'postId', as: 'sentRequests' });
// db.request.belongsTo(models.post, { foreignKey: 'postId', as: 'post' });
//-----------------------------------------------------
//request - post relationship (one to many)
// db.tournament.hasMany(db.request, { foreignKey: 'tournamentId', as: 'sentRequests' });
// db.request.belongsTo(db.tournament, { foreignKey: 'tournamentId', as: 'tournament' });
//-----------------------------------------------------
// club - utility relationship (many to many) through club_utility

//-----------------------------------------------------

// club - subscription relationship (one to many) one club many subscriptions

//-----------------------------------------------------

// subscription - plan relationship (one to many) one plan many subscriptions

module.exports = db;
