//TODO: add marketplace for all users & payment script
//TODO: add payment method with crypto to buy ebook
//TODO: subdomein for users / book names ? optional
//TODO: add bycrypt to passwords


require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const port = process.env.PORT || 3000;


const User = require("./models/user");
const passport = require("passport");
const passportConfig = require("./passport");
const session = require("cookie-session");
const flash = require("express-flash");
const multer = require('multer');
const path = require('path');
const { scheduleSalesGeneration } = require("./gensales"); //-- UNCOMMENT TO START SCRIPT

const settingsRouter = require("./routes/settings");
const dashboardRouter = require("./routes/dashboard");
const payoutRouter = require("./routes/payout");
const productsRouter = require("./routes/products");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/adminpanel");


const app = express();

mongoose.connect(process.env.DB_URL);
mongoose.connection.on("open", () => console.log("Connected to Database"));

function getSaveDirectory() {
  const railwayVolumeMountPath = process.env.RAILWAY_VOLUME_MOUNT_PATH;
  return (railwayVolumeMountPath) ? railwayVolumeMountPath : path.join(__dirname, "uploads");
}

const saveDirectory = getSaveDirectory();

console.log("server using storage location: " + saveDirectory);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(saveDirectory));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use("/", authRouter);
app.use("/dashboard", dashboardRouter);
app.use("/settings", settingsRouter);
app.use("/payout", payoutRouter);
app.use("/products", productsRouter);
app.use("/adminpanel", adminRouter)


app.get("/", (req, res) => {
  res.render("login");
});

app.use((req, res, next) => {
  res.status(404).render("404");
});

app.listen(port, () =>
  console.log(`Server has started on port ${port}`)
);
