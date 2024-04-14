const express = require("express");
const router = require("express").Router();
const ensureAuthenticated = require("../middleware/auth");

//TODO:: crypto legit + paypal failed systeem

// router.get("/", ensureAuthenticated, (req, res) => {
//   res.render("premium");
// });

module.exports = router;
