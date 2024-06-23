const Decimal = require("decimal.js");
const db = require("../models");
const Plan = db.plan;

async function createPlan(req, res) {
  try {
    const { name, price, duration } = req.body;
    const planName = await Plan.findOne({ where: { name: name } });
    if (planName) {
      return res.status(400).json({ message: "Plan name already exists" });
    }
    // convert price to decimal using decimal.js library
    let priceDecimal;
    try {
      priceDecimal = new Decimal(price);
    } catch (e) {
      console.error(e);
      return res.status(400).json({ message: "Invalid price format" });
    }
    // Validate that the duration is a positive integer
    if (duration <= 0) {
      return res
        .status(400)
        .json({ message: "Duration must be a positive integer" });
    }
    // create the plan
    // return the created plan
    const plan = await Plan.create({
      name,
      price: priceDecimal.toFixed(2),
      duration,
    });
    res.status(201).json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating plan", error });
  }
}
// Get all plans
async function getPlans(req, res) {
  try {
    const plans = await Plan.findAll();
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving plans", error });
  }
}
// Get plan by id
async function getPlanById(req, res) {
  const { planId } = req.params;
  try {
    const plan = await Plan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving plans", error });
  }
}
// delete plan by its id
async function deletePlanById(req, res) {
  const { planId } = req.params;
  try {
    const plan = await Plan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    await plan.destroy();
    res.status(200).json({ message: "Plan deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" + error });
  }
}
// edit plan by its id
async function editPlanById(req, res) {
  try {
    const { planId } = req.params;
    const { name, price, duration } = req.body;
    const plan = await Plan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    //update plan
    plan.name = name;
    plan.price = price;
    plan.duration = duration;
    await plan.save();

    res.status(200).json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" + error });
  }
}
module.exports = {
  createPlan,
  getPlans,
  getPlanById,
  deletePlanById,
  editPlanById,
};
