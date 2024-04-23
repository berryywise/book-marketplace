const express = require('express');
const router = express.Router();

const ensureAuthenticated = require("../middleware/auth");

router.get("/", ensureAuthenticated, async (req, res) => {

    res.render("marketplace", {user: req.user})

})

module.exports = router;
