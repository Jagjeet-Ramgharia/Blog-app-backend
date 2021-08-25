const router = require("express").Router();
const Category = require("../models/Category");

//create

router.post("/", async (req, res) => {
  try {
    const categories = new Category(req.body);
    const savedCategories = await categories.save();
    res.status(201).json(savedCategories);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
