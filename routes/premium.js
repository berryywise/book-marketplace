const express = require("express");
const router = require("express").Router();
const ensureAuthenticated = require("../middleware/auth");

// router.get("/", ensureAuthenticated, (req, res) => {
//   res.render("premium");
// });

module.exports = router;
