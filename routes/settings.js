const express = require("express");
const router = express.Router();
const User = require("../models/user");
const ensureAuthenticated = require("../middleware/auth");
const { check, validationResult } = require("express-validator");
const timeoutMiddleware = require("../middleware/timeout");
const adminLogger = require("../middleware/adminLogger");

const validateSettingsRequest = [
  check("firstname")
    .optional({ values: "falsy" })
    .trim()
    .escape()
    .isLength({ min: 1, max: 15 })
    .withMessage("Firstname must be between 1 and 15 characters long."),
  check("lastname")
    .optional({ values: "falsy" })
    .trim()
    .escape()
    .isLength({ min: 1, max: 15 })
    .withMessage("Lastname must be between 1 and 15 characters long."),
  check("iban")
    .optional({ values: "falsy" })
    .trim()
    .escape()
    .isLength({ min: 15, max: 35 })
    .withMessage("Iban must be between 15 and 35 characters long."),
  check("btc")
    .optional({ values: "falsy" })
    .trim()
    .escape()
    .isLength({ min: 30, max: 64 })
    .withMessage("BTC must be between 30 and 64 characters long."),
  check("eth")
    .optional({ values: "falsy" })
    .trim()
    .escape()
    .isLength({ min: 40, max: 44 })
    .withMessage("ETH must be between 40 and 44 characters long."),
  check("ltc")
    .optional({ values: "falsy" })
    .trim()
    .escape()
    .isLength({ min: 25, max: 36 })
    .withMessage("LTC must be between 25 and 36 characters long."),
  check("paypal").optional({ values: "falsy" }).trim().escape().isEmail(),
  check("city")
    .optional({ values: "falsy" })
    .trim()
    .escape()
    .isLength({ min: 1, max: 15 })
    .withMessage("City must be between 1 and 15 characters long."),
  check("address")
    .optional({ values: "falsy" })
    .trim()
    .escape()
    .isLength({ min: 1, max: 40 })
    .withMessage("Address must be between 1 and 40 characters long."),
  check("country")
    .optional({ values: "falsy" })
    .trim()
    .escape()
    .isLength({ min: 1, max: 40 })
    .withMessage("Country must be between 1 and 40 characters long."),
  check("postalcode")
    .optional({ values: "falsy" })
    .trim()
    .escape()
    .isLength({ min: 1, max: 10 })
    .withMessage("Postal code must be between 1 and 10 characters long."),
  check("phonenumber")
    .optional({ values: "falsy" })
    .trim()
    .escape()
    .isLength({ min: 1, max: 17 })
    .withMessage("Phone number must be between 1 and 17 characters long."),
];

router.get("/", ensureAuthenticated, async (req, res) => {
  let payoutOption = "";
  let payoutValue = "";

  if (req.user.payout_option === "iban")
    (payoutOption = "IBAN"), (payoutValue = req.user.iban);
  if (req.user.payout_option === "btc")
    (payoutOption = "Bitcoin (BTC)"), (payoutValue = req.user.btc_wallet);
  if (req.user.payout_option === "eth")
    (payoutOption = "Ethereum (ETH)"), (payoutValue = req.user.eth_wallet);
  if (req.user.payout_option === "ltc")
    (payoutOption = "Litecoin (LTC)"), (payoutValue = req.user.ltc_wallet);
  if (req.user.payout_option === "paypal")
    (payoutOption = "PayPal"), (payoutValue = req.user.paypal_wallet);

  if (payoutValue === "") payoutValue = "No active payment method selected";

  res.render("settings", { user: req.user, payoutOption, payoutValue });
});

router.get("/edit", ensureAuthenticated, (req, res) => {
  res.render("edit", { user: req.user, errors: [] });
});

router.post(
  "/edit",
  ensureAuthenticated,
  timeoutMiddleware,
  validateSettingsRequest,
  adminLogger,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res
        .status(400)
        .render("edit", { user: req.user, errors: errors.array() });
    }

    try {
      const userId = req.user._id;

      const updateObject = {};

      if (req.body.firstname) updateObject.firstname = req.body.firstname;
      if (req.body.lastname) updateObject.lastname = req.body.lastname;
      if (req.body.payoutoption)
        updateObject.payout_option = req.body.payoutoption;
      if (req.body.iban) updateObject.iban = req.body.iban;
      if (req.body.btc) updateObject.btc_wallet = req.body.btc;
      if (req.body.eth) updateObject.eth_wallet = req.body.eth;
      if (req.body.ltc) updateObject.ltc_wallet = req.body.ltc;
      if (req.body.paypal) updateObject.paypal_wallet = req.body.paypal;
      if (req.body.city) updateObject.city = req.body.city;
      if (req.body.address) updateObject.address = req.body.address;
      if (req.body.country) updateObject.country = req.body.country;
      if (req.body.postalcode) updateObject.postalcode = req.body.postalcode;
      if (req.body.phonenumber) updateObject.phonenumber = req.body.phonenumber;
      if (req.body.dateofbirth) updateObject.dateofbirth = req.body.dateofbirth;

      Object.keys(updateObject).forEach((key) => {
        if (updateObject[key] === "") {
          delete updateObject[key];
        }
      });

      await User.findByIdAndUpdate(userId, updateObject, {
        new: true,
      });
      res.redirect("/settings");
    } catch {
      res.redirect("/settings");
    }
  }
);

module.exports = router;
