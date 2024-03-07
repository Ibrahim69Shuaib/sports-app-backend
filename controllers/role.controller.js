const db = require("../models");
const Role = db.role;
const Permission = db.permission;

const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.status(200).json(roles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving roles" });
  }
};

const getRolesWithPermissions = async (req, res) => {
  try {
    const roles = await Role.findAll({
      attributes: ["id", "name"], // Include only the necessary attributes from the Role model
      include: [
        {
          model: Permission,
          attributes: ["id", "name"], // Include only the necessary attributes from the Permission model
          through: { attributes: [] },
        },
      ],
    });

    res.status(200).json(roles);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error retrieving roles with permissions" });
  }
};

const assignPermissionsToRole = async (req, res) => {
  const { roleId, permissionId } = req.body;

  try {
    const role = await Role.findByPk(roleId);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Assign permissions to the role using the junction table
    await role.addPermissions(permissionId);

    res
      .status(200)
      .json({ message: "Permission assigned to role successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error assigning permission to role" });
  }
};

const getRoleByName = async (req, res) => {
  const { name } = req.params;

  try {
    const role = await Role.findOne({
      where: { name },
      include: [
        {
          model: Permission,
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.status(200).json(role);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving role" });
  }
};

const getRoleById = async (req, res) => {
  const { id } = req.params;

  try {
    const role = await Role.findByPk(id, {
      include: [
        {
          model: Permission,
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.status(200).json(role);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving role" });
  }
};

module.exports = {
  getAllRoles,
  getRolesWithPermissions,
  assignPermissionsToRole,
  getRoleByName,
  getRoleById,
};
