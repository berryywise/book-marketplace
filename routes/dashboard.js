const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Sales = require("../models/sales");
const ensureAuthenticated = require("../middleware/auth");

router.get("/", ensureAuthenticated, async (req, res) => {
  const PAGE_ORDERS = 10;
  let page = parseInt(req.query.page) || 1;

  try {
    const skip = (page - 1) * PAGE_ORDERS;

    const recentSales = await Sales.find({ owner: req.user })
      .populate("product")
      .sort({"createdAt": -1})
      .skip(skip)
      .limit(PAGE_ORDERS);

    const updatedUser = await User.findById(req.user._id);

    const currentbalance = updatedUser.currentbalance.toFixed(2);

    const hasNextPage = await Sales.findOne({ owner: req.user })
      .skip(skip + PAGE_ORDERS)
      .limit(1)
      .select("_id");

    res.render("dashboard", {
      user: req.user,
      recentSales,
      currentbalance,
      hasNextPage,
      nextPage: page + 1,
    });
  } catch (error) {
    console.error("Error on the dashboard:", error);
    res.render("dashboard", {
      user: req.user,
      message: "An error occurred on the dashboard.",
    });
  }
});

module.exports = router;
