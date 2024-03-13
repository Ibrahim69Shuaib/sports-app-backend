//this is a seeding script for adding rows to roles , permissions and role_permissions tables and bulk create users.
//add here any tables that needs to be filled with static rows.

//add seeding for  sports table , positions table <<DONE>>
//add club services  here in the future

const db = require("../models");
const Role = db.role;
const Permission = db.permission;
const User = db.user;
const Sport = db.sport;
const Position = db.position;

// Sample data
const usersData = [
  {
    id: 4,
    username: "barho1231",
    email: "<test22@mail.com>",
    password: "<PASSWORD>",
    role_id: 1,
  },
  {
    id: 5,
    username: "barho21231",
    email: "<test222@mail.com>",
    password: "<PASSWORD>",
    role_id: 2,
  },
  {
    id: 6,
    username: "barho31231",
    email: "<test324@mail.com>",
    password: "<PASSWORD>",
    role_id: 3,
  },
];

const rolesData = [
  { id: 1, name: "player" },
  { id: 2, name: "club" },
  { id: 3, name: "admin" },
];

const permissionsData = [
  { name: "manage team" },
  { name: "make reservation" },
  { name: "create player profile" },
  { name: "make refund" },
  { name: "make payments" },
  { name: "add funds" },
  { name: "create club profile" },
  { name: "add utilities" },
  { name: "subscribe to plan" },
  { name: "create tournament" },
  { name: "add fields" },
  { name: "add durations" },
  { name: "manage clubs accounts" },
  { name: "block clubs" },
  { name: "view statistics" },
];

const seedUsers = async () => {
  await User.bulkCreate(usersData);
};

const seedRolesAndPermissions = async () => {
  // Create roles
  for (const roleData of rolesData) {
    await Role.findOrCreate({
      where: { name: roleData.name },
      defaults: roleData,
    });
  }

  // Create permissions
  for (const permissionData of permissionsData) {
    await Permission.findOrCreate({
      where: { name: permissionData.name },
      defaults: permissionData,
    });
  }

  // Get instances of roles and permissions
  const playerRole = await Role.findOne({ where: { name: "player" } });
  const clubRole = await Role.findOne({ where: { name: "club" } });
  const adminRole = await Role.findOne({ where: { name: "admin" } });

  // player permissions
  const manage_team_Permission = await Permission.findOne({
    where: { name: "manage team" },
  });
  const make_reservation_Permission = await Permission.findOne({
    where: { name: "make reservation" },
  });
  const create_player_profile_Permission = await Permission.findOne({
    where: { name: "create player profile" },
  });
  const make_refund_Permission = await Permission.findOne({
    where: { name: "make refund" },
  });
  const make_payments_Permission = await Permission.findOne({
    where: { name: "make payments" },
  });
  const add_funds_Permission = await Permission.findOne({
    where: { name: "add funds" },
  });
  //club permissions
  const create_club_profile_Permission = await Permission.findOne({
    where: { name: "create club profile" },
  });
  const add_utilities_Permission = await Permission.findOne({
    where: { name: "add utilities" },
  });
  const subscribe_to_plan_Permission = await Permission.findOne({
    where: { name: "subscribe to plan" },
  });
  const create_tournament_Permission = await Permission.findOne({
    where: { name: "create tournament" },
  });
  const add_fields_Permission = await Permission.findOne({
    where: { name: "add fields" },
  });
  const add_durations_Permission = await Permission.findOne({
    where: { name: "add durations" },
  });
  // admin permissions
  const manage_clubs_accounts_Permission = await Permission.findOne({
    where: { name: "manage clubs accounts" },
  });
  const block_clubs_Permission = await Permission.findOne({
    where: { name: "block clubs" },
  });
  const view_statistics_Permission = await Permission.findOne({
    where: { name: "view statistics" },
  });
  // Using the generated RolePermission model to associate roles and permissions
  //player role permissions
  await playerRole.addPermission(manage_team_Permission);
  await playerRole.addPermission(make_reservation_Permission);
  await playerRole.addPermission(create_player_profile_Permission);
  await playerRole.addPermission(make_refund_Permission);
  await playerRole.addPermission(make_payments_Permission);
  await playerRole.addPermission(add_funds_Permission);
  //club role permissions
  await clubRole.addPermission(create_club_profile_Permission);
  await clubRole.addPermission(add_utilities_Permission);
  await clubRole.addPermission(subscribe_to_plan_Permission);
  await clubRole.addPermission(create_tournament_Permission);
  await clubRole.addPermission(add_fields_Permission);
  await clubRole.addPermission(add_durations_Permission);
  //admin role permissions
  await adminRole.addPermission(manage_clubs_accounts_Permission);
  await adminRole.addPermission(block_clubs_Permission);
  await adminRole.addPermission(view_statistics_Permission);
};

// Sample data for sports
const sportsData = [
  { name: "Football" },
  { name: "Basketball" },
  { name: "Tennis" },
  { name: "Badminton" },
];

// Sample data for positions
const positionsData = [
  // Football  Positions
  { name: "Goalkeeper", key: "GK" },
  { name: "Right Back", key: "RB" },
  { name: "Left Wing", key: "LW" },
  { name: "Left Back", key: "LB" },
  { name: "Center Back", key: "CB" },
  { name: "Defensive Mid Field", key: "DMF" },
  { name: "Right Wing", key: "RW" },
  { name: "Central Midfield", key: "CM" },
  { name: "Striker", key: "ST" },
  { name: "Center Attacking Midfield", key: "CAM" },
  { name: "Central Forward", key: "CF" },
  // Basketball Positions
  { name: "Center", key: "C" },
  { name: "Power Forward", key: "PF" },
  { name: "Small Forward", key: "SF" },
  { name: "Point Guard", key: "PG" },
  { name: "Shooting Guard", key: "SG" },
  // Tennis Positions
  { name: "Base Liner" },
  { name: "Serve-and-Volley" },
  { name: "All-Court" },
  // Badminton Positions
  { name: "Attacking-Stance" },
  { name: "Defensive-Stance" },
  { name: "Net-Stance" },
];

const seedSportsAndPositions = async () => {
  // Create sports
  for (const sportData of sportsData) {
    await Sport.findOrCreate({
      where: { name: sportData.name },
      defaults: sportData,
    });
  }

  // Create positions
  for (const positionData of positionsData) {
    await Position.findOrCreate({
      where: { name: positionData.name },
      defaults: positionData,
    });
  }

  // Get instances of sports
  const footballSport = await Sport.findOne({ where: { name: "Football" } });
  const basketballSport = await Sport.findOne({
    where: { name: "Basketball" },
  });
  const tennisSport = await Sport.findOne({
    where: { name: "Tennis" },
  });
  const badmintonSport = await Sport.findOne({
    where: { name: "Badminton" },
  });
  // Get instances of positions
  // Instances of Football positions
  const goalkeeperPosition = await Position.findOne({
    where: { name: "Goalkeeper" },
  });
  const right_backPosition = await Position.findOne({
    where: { name: "Right Back" },
  });
  const left_wingPosition = await Position.findOne({
    where: { name: "Left Wing" },
  });
  const left_backPosition = await Position.findOne({
    where: { name: "Left Back" },
  });
  const center_backPosition = await Position.findOne({
    where: { name: "Center Back" },
  });
  const defensive_mid_fieldPosition = await Position.findOne({
    where: { name: "Defensive Mid Field" },
  });
  const right_wingPosition = await Position.findOne({
    where: { name: "Right Wing" },
  });
  const central_midfieldPosition = await Position.findOne({
    where: { name: "Central Midfield" },
  });
  const strikerPosition = await Position.findOne({
    where: { name: "Striker" },
  });
  const center_attacking_midfieldPosition = await Position.findOne({
    where: { name: "Center Attacking Midfield" },
  });
  const central_forwardPosition = await Position.findOne({
    where: { name: "Central Forward" },
  });
  // instances of Basketball positions
  const centerPosition = await Position.findOne({
    where: { name: "Center" },
  });
  const power_forwardPosition = await Position.findOne({
    where: { name: "Power Forward" },
  });
  const small_forwardPosition = await Position.findOne({
    where: { name: "Small Forward" },
  });
  const point_guardPosition = await Position.findOne({
    where: { name: "Point Guard" },
  });
  const shooting_guardPosition = await Position.findOne({
    where: { name: "Shooting Guard" },
  });
  // instances of Tennis positions
  const base_linerPosition = await Position.findOne({
    where: { name: "Base Liner" },
  });
  const serve_and_volleyPosition = await Position.findOne({
    where: { name: "Serve-and-Volley" },
  });
  const all_courtPosition = await Position.findOne({
    where: { name: "All-Court" },
  });
  // instances of  Badminton positions
  const attacking_stancePosition = await Position.findOne({
    where: { name: "Attacking-Stance" },
  });
  const defensive_stancePosition = await Position.findOne({
    where: { name: "Defensive-Stance" },
  });
  const net_stancePosition = await Position.findOne({
    where: { name: "Net-Stance" },
  });
  // associating sports with their positions
  // Football associations
  await footballSport.addPosition(goalkeeperPosition);
  await footballSport.addPosition(right_backPosition);
  await footballSport.addPosition(left_wingPosition);
  await footballSport.addPosition(left_backPosition);
  await footballSport.addPosition(center_backPosition);
  await footballSport.addPosition(defensive_mid_fieldPosition);
  await footballSport.addPosition(right_wingPosition);
  await footballSport.addPosition(central_midfieldPosition);
  await footballSport.addPosition(strikerPosition);
  await footballSport.addPosition(center_attacking_midfieldPosition);
  await footballSport.addPosition(central_forwardPosition);
  // Basketball associations
  await basketballSport.addPosition(centerPosition);
  await basketballSport.addPosition(power_forwardPosition);
  await basketballSport.addPosition(small_forwardPosition);
  await basketballSport.addPosition(point_guardPosition);
  await basketballSport.addPosition(shooting_guardPosition);
  // Tennis associations
  await tennisSport.addPosition(base_linerPosition);
  await tennisSport.addPosition(serve_and_volleyPosition);
  await tennisSport.addPosition(all_courtPosition);
  // Badminton associations
  await badmintonSport.addPosition(attacking_stancePosition);
  await badmintonSport.addPosition(defensive_stancePosition);
  await badmintonSport.addPosition(net_stancePosition);
  console.log("Sports and Positions seeded successfully.");
};

// Call seeding functions
//seeding users here wont encrypt their passwords and will cause an error if duplicate users exist
// seedUsers();
seedSportsAndPositions();
// seedRolesAndPermissions();
