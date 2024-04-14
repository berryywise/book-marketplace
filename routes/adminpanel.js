const express = require("express");
const router = require("express").Router();
const Admin = require("../models/admin");
const ensureAuthenticated = require("../middleware/auth");
const ensureAdmin = require("../middleware/admin");

router.get("/", ensureAuthenticated, ensureAdmin, async (req, res) => {
  const adminData = await Admin.findOne({});

  const data = {
    max_product: adminData.max_product_price,
    max_limit: adminData.max_product_limit,
    max_sales: adminData.max_sales_day,
    toggled: adminData.sales_are_running,
    days: adminData.admin_review_days,
    schedule: adminData.cron_schedule,
    reviewed: adminData.products_in_review,
  };

  if (data.schedule === "*/2 * * * *") {
    data.schedule = "2 minutes"
  } else {
    data.schedule = "24 hours"
  }

  if(data.toggled === false) {
    data.toggled = "Not running!"
  } else {
    data.schedule = "Sales are live!"
  }


  res.render("admin", { user: req.user, data });
});

module.exports = router;
