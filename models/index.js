const dbConfig = require("../config/database.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  port: dbConfig.port, // 3307 for filess ,this line for filess io database connection 3306 for local instance
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
db.club_follow = require("./club_follow.model.js")(sequelize, Sequelize);
db.wallet = require("./wallet.model.js")(sequelize, Sequelize);
db.transaction = require("./transaction.model.js")(sequelize, Sequelize);
db.player_lineup = require("./player_lineup.model.js")(sequelize, Sequelize);
db.reservation = require("./reservation.model.js")(sequelize, Sequelize);
db.refund_policy = require("./refund_policy.model.js")(sequelize, Sequelize);
db.utilities = require("./utilities.model.js")(sequelize, Sequelize);
db.club_rating = require("./club_rating.model.js")(sequelize, Sequelize);
db.team_follow = require("./team_follow.model.js")(sequelize, Sequelize);
db.post = require("./post.model.js")(sequelize, Sequelize);
//db.notification= require("./notification..model.js")(sequelize, Sequelize);
//db.plan= require ("./plan.model.js")(sequelize, Sequelize);
//db.subscription= require ("./subscription.model.js")(sequelize,Sequelize);
//tournaments...
//team follow

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
// user - wallet relationship (one to one)
db.user.hasOne(db.wallet, { foreignKey: "user_id" });
db.wallet.belongsTo(db.user, { foreignKey: "user_id" });
//-----------------------------------------------------
// user - transaction relationship (one to many)
db.user.hasMany(db.transaction, { foreignKey: "user_id" });
db.transaction.belongsTo(db.user, { foreignKey: "user_id" });
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
//sport - position relationship (many to many) FIXME: BE WARE FK ARE AUTOMATICALLY GENERATED HERE (sportId , positionId)
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
//player - follow_club relationship (one to many)
db.player.hasMany(db.club_follow, { foreignKey: "player_id" });
db.club_follow.belongsTo(db.player, { foreignKey: "player_id" });
//-----------------------------------------------------
// club - follow_club relationship (one to many)
db.club.hasMany(db.club_follow, { foreignKey: "club_id" });
db.club_follow.belongsTo(db.club, { foreignKey: "club_id" });
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
// team - player_lineup relationship (one to many)
db.team.hasMany(db.player_lineup, { foreignKey: "team_id" });
db.player_lineup.belongsTo(db.team, { foreignKey: "team_id", as: "team" });
//-----------------------------------------------------
// player - player_lineup relationship (one to many)
db.player.hasMany(db.player_lineup, { foreignKey: "player_id" });
db.player_lineup.belongsTo(db.player, {
  foreignKey: "player_id",
  as: "player",
});
//-----------------------------------------------------
// position - player_lineup relationship
db.position.hasMany(db.player_lineup, { foreignKey: "position_id" });
db.player_lineup.belongsTo(db.position, {
  foreignKey: "position_id",
  as: "position",
});
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
//reservation - user relationship (one to many)
db.user.hasMany(db.reservation, { foreignKey: "user_id" });
db.reservation.belongsTo(db.user, { foreignKey: "user_id" });
//-----------------------------------------------------
//reservation - user relationship (one to many)
db.duration.hasMany(db.reservation, { foreignKey: "duration_id" });
db.reservation.belongsTo(db.duration, { foreignKey: "duration_id" });
//-----------------------------------------------------
//reservation - transaction relationship (one to many)
db.reservation.hasMany(db.transaction, { foreignKey: "reservation_id" });
db.transaction.belongsTo(db.reservation, { foreignKey: "reservation_id" });
//-----------------------------------------------------
//refund_policy - club relationship (one to one)
db.club.hasOne(db.refund_policy, { foreignKey: "club_id" });
db.refund_policy.belongsTo(db.club, { foreignKey: "club_id" });
//-----------------------------------------------------
//club_rating - club relationship (one to many)
db.club.hasMany(db.club_rating, { foreignKey: "club_id" });
db.club_rating.belongsTo(db.club, { foreignKey: "club_id" });
//-----------------------------------------------------
//club_rating - player relationship (one to many)
db.player.hasMany(db.club_rating, { foreignKey: "player_id" });
db.club_rating.belongsTo(db.player, { foreignKey: "player_id" });
//-----------------------------------------------------
// club - utility relationship (many to many) through club_utility
db.club.belongsToMany(db.utilities, {
  through: "club_utilities",
  foreignKey: "club_id",
  timestamps: false,
});
db.utilities.belongsToMany(db.club, {
  through: "club_utilities",
  foreignKey: "utilities_id",
  timestamps: false,
});
//-----------------------------------------------------
//player - team_follow relationship (one to many)
db.player.hasMany(db.team_follow, { foreignKey: "player_id" });
db.team_follow.belongsTo(db.player, { foreignKey: "player_id" });
//-----------------------------------------------------
// team - team_follow relationship (one to many)
db.team.hasMany(db.team_follow, { foreignKey: "team_id" });
db.team_follow.belongsTo(db.team, { foreignKey: "team_id" });
//-----------------------------------------------------
// Association between Player and Post
db.player.hasMany(db.post, { foreignKey: "player_id" });
db.post.belongsTo(db.player, { foreignKey: "player_id" });
//-----------------------------------------------------
// Association between Reservation and Post
db.reservation.hasMany(db.post, { foreignKey: "reservation_id" });
db.post.belongsTo(db.reservation, { foreignKey: "reservation_id" });
//-----------------------------------------------------
//request - post relationship (one to many)
db.post.hasMany(db.request, { foreignKey: "post_id", as: "sentRequests" });
db.request.belongsTo(db.post, { foreignKey: "post_id", as: "post" });
//-----------------------------------------------------
//request - tournament relationship (one to many)
// db.tournament.hasMany(db.transaction, { foreignKey: 'tournament_id' });
// db.transaction.belongsTo(db.tournament, { foreignKey: 'tournament_id' });
//-----------------------------------------------------

// club - subscription relationship (one to many) one club many subscriptions

//-----------------------------------------------------

// subscription - plan relationship (one to many) one plan many subscriptions

module.exports = db;
