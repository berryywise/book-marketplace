const express = require("express");
const router = require("express").Router();
const Admin = require("../models/admin");
const Product = require("../models/products");
const ensureAuthenticated = require("../middleware/auth");
const ensureAdmin = require("../middleware/admin");

router.get("/", ensureAuthenticated, ensureAdmin, async (req, res) => {
  const products = await Product.find({ in_review: true, deleted: false, declined: false }).populate("user");

  res.render("admin", { user: req.user, products });
});

router.post("/approve", ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const itemId = req.body.elementId;

    await Product.findByIdAndUpdate(itemId, { $set: { in_review: false } });

    res.redirect("/adminpanel");

  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/decline", ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const itemId = req.body.elementId;

    await Product.findByIdAndUpdate(itemId, { $set: { declined: true } });

    res.redirect("/adminpanel");

  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
