const express = require("express");
const router = require("express").Router();
const Admin = require("../models/admin");
const Product = require("../models/products");
const User = require("../models/user");
const ensureAuthenticated = require("../middleware/auth");
const ensureAdmin = require("../middleware/admin");

router.get("/", ensureAuthenticated, ensureAdmin, async (req, res) => {

  const products = await Product.find({ in_review: true, deleted: false, declined: false }).populate("user");
  const usersInReview = await User.find({ inreview: true })

  res.render("admin", { user: req.user, products, usersInReview});
});

router.post("/approveproduct", ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const itemId = req.body.elementId;

    await Product.findByIdAndUpdate(itemId, { $set: { in_review: false } });

    res.redirect("/adminpanel");

  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/declineproduct", ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const itemId = req.body.elementId;

    await Product.findByIdAndUpdate(itemId, { $set: { declined: true } });

    res.redirect("/adminpanel");

  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/approveuser", ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const userId = req.body.userId;

    await User.findByIdAndUpdate(userId, { $set: { inreview: false } });

    res.redirect("/adminpanel");

  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
