const db = require("../models");
const Permission = db.permission;

const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    res.status(200).json(permissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving permissions" });
  }
};

const addPermission = async (req, res) => {
  const { name } = req.body;

  try {
    const newPermission = await Permission.create({ name });
    res.status(201).json(newPermission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding permission" });
  }
};

const getPermissionByName = async (req, res) => {
  const { name } = req.params;

  try {
    const permission = await Permission.findOne({ where: { name } });

    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    res.status(200).json(permission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving permission" });
  }
};

const getPermissionById = async (req, res) => {
  const { id } = req.params;

  try {
    const permission = await Permission.findByPk(id);

    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    res.status(200).json(permission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving permission" });
  }
};

const editPermission = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const permission = await Permission.findByPk(id);

    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    // Update the permission
    permission.name = name;
    permission.description = description;
    await permission.save();

    res.status(200).json({ message: "Permission updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating permission" });
  }
};

const deletePermissionById = async (req, res) => {
  const permissionId = req.params.id;

  try {
    // Check if the permission exists
    const existingPermission = await Permission.findByPk(permissionId);

    if (!existingPermission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    // Delete the permission
    await Permission.destroy({
      where: {
        id: permissionId,
      },
    });

    res.status(200).json({ message: "Permission deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting permission" });
  }
};

module.exports = {
  getAllPermissions,
  addPermission,
  getPermissionByName,
  getPermissionById,
  editPermission,
  deletePermissionById,
};
