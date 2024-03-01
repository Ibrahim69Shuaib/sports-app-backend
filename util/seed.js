//this is a seeding script for adding rows to roles , permissions and role_permissions tables and bulk create users.
//add here any tables that needs to be filled with static rows.
const db = require("../models");
const Role = db.role;
const Permission = db.permission;
const User = db.user;

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

// Call seeding functions
//seeding users here wont encrypt their passwords and will cause an error if duplicate users exist
// seedUsers();
seedRolesAndPermissions();
