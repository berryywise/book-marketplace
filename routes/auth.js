require("dotenv").config();
const express = require("express");
const passport = require("passport");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { check, validationResult } = require("express-validator");
const timeoutMiddleware = require("../middleware/timeout");
const ensureAuthenticated = require("../middleware/auth");
let fs = require('fs');
const ejs = require('ejs');

const router = express.Router();

const secretKey = "your-secret-key";

let transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const templatePath = './views/email_confirm.ejs';
const templateContent = fs.readFileSync(templatePath, 'utf-8');

const resetTemplatePath = './views/password-forgot.ejs';
const resetTemplateContent = fs.readFileSync(resetTemplatePath, 'utf-8');


const validateSignUpRequest = [
  check("username")
    .trim()
    .notEmpty()
    .escape()
    .withMessage("Username is required")
    .custom(async (value) => {
      const existingUser = await User.findOne({ username: value });

      if (existingUser) {
        return Promise.reject("Username is already taken");
      }
      return true;
    }),
  check("email")
    .trim()
    .isEmail()
    .escape()
    .withMessage("Invalid email address")
    .custom(async (value) => {
      const existingUser = await User.findOne({ email: value });

      if (existingUser) {
        return Promise.reject("Email is already taken");
      }
      return true;
    }),
  check("password")
    .notEmpty()
    .escape()
    .withMessage("Password is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("must be at least 3 chars long and max 20 chars."),
];

router.get("/login", async (req, res) => {
  res.render("login");
});

router.post(
  "/login",
  timeoutMiddleware,
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

router.get("/signup", (req, res) => {
  res.render("signup", { errors: [] }); // Create a registration form
});

router.get("/verify/:token", async (req, res) => {
  const { token } = req.params;

  // Verify the token
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.send("Invalid or expired token.");
    }

    const user = await User.findOne({ email: decoded.email });

    if (!user || user.emailtoken !== token) {
      return res.send("Invalid or expired token.");
    }

    // Update user status to verified
    user.emailverified = true;

    await user.save();

    res.render("confirmed", {
      success:
        "Thank you for confirming your email.",
    });
  });
});

router.post(
  "/signup",
  timeoutMiddleware,
  validateSignUpRequest,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("signup", { errors: errors.array() });
    }

    try {
      const { email, username, password } = req.body;

      const emailtoken = await createToken(req.body);

      const newUser = new User({ email, username, password, emailtoken });

      await newUser.save();

      const mailOptions = await sendVerification(req.body, emailtoken);

      await transporter.sendMail(mailOptions, (error, info) => {
        console.log(error);
        res.render("login", {
          success:
            "Registration successful. Please check your email inbox and / or spam box for confirmation.",
        });
      });
    } catch (error) {
      console.error("Error:", error);
      res.redirect("/signup");
    }
  }
);

router.post(
  "/resend-verification",
  ensureAuthenticated,
  timeoutMiddleware,
  (req, res) => {
    if (req.user.emailverified) {
      return res.redirect("404");
    }

    resendVerification(req.user);

    res.render("confirmed", {
      success:
        "Email confirmation has been resend. Please check your inbox and / or spam box.",
    });
  }
);

const resendVerification = async (body) => {
  const emailtoken = await createToken(body);

  body.emailtoken = emailtoken;

  await body.save();

  const mailOptions = await sendVerification(body, emailtoken);

  await transporter.sendMail(mailOptions, (error, info) => {
    console.log(error);
  });
};

const sendVerification = async (body, emailtoken) => {
  const { email } = body;

  const confirmationLink = `https://app.bookmaniac.net/verify/${emailtoken}`; //TODO:: change url production

  const renderedTemplate = ejs.render(templateContent, { confirmationLink: confirmationLink });

  const mailOptions = {
    from: "Bookmaniac <info@bookmaniac.net>",
    to: email,
    subject: "Confirm Your Email",
    html: renderedTemplate,
  };

  return mailOptions;
};

const createToken = async (body) => {
  const { email } = body;

  const emailtoken = jwt.sign({ email }, secretKey, { expiresIn: "1h" });

  return emailtoken;
};

router.get("/reset-password", (req, res) => {
  res.render("reset-password", { errors: [] });
});

router.post(
  "/reset-password",
  timeoutMiddleware,
  [
    check("email")
      .notEmpty()
      .trim()
      .escape()
      .isEmail()
      .withMessage("Invalid email address"),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .render("reset-password", { errors: errors.array() });
    }

    try {
      // Find user by email
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        return res.render("reset-password", { error: "User not found" });
      }

      const resetToken = jwt.sign({ userId: user._id }, "your-secret-key", {
        expiresIn: "1h",
      });

      user.resettoken = resetToken;

      await user.save();

      // Send email with the reset link
      const resetLink = `https://app.bookmaniac.net/reset/?token=${resetToken}`; //TODO:: change url production

      const renderedTemplate = ejs.render(resetTemplateContent, { resetLink });

      const mailOptions = {
        from: "Bookmaniac <info@bookmaniac.net>",
        to: user.email,
        subject: "Password Reset",
        html: renderedTemplate,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.send("Error sending email");
        }

        return res.render("reset-password", {
          success:
          "Password reset has been send. Please check your inbox and / or spam box",
        });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.get("/reset/", timeoutMiddleware, async (req, res) => {

  const currentTokens = await User.findOne({resettoken: req.query.token})

  if(!req.query.token) {
    return res.redirect("404");
  }

  if(!currentTokens) {
    return res.send("Invalid or expired token.");
  }

  res.render("reset", {tokenValue: req.query.token}); // Create a registration form

});

router.post("/reset/", [
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 3 })
    .withMessage("Password must be at least 3 characters long"),
],timeoutMiddleware, async (req, res) => {

  try {
    
    const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.send("Password is required and must be at least 3 characters long");
      }
  
    const currentTokens = await User.findOne({resettoken: req.body.token})
  
    currentTokens.password = req.body.password;
    currentTokens.resettoken = "";
  
    await currentTokens.save()
  
    return res.render("login", {
      success:
      "Password updated successfully",
    });

  } catch (error) {
    console.error(error);
      return res.send("Token is expired or invalid");
  }


});

module.exports = router;
