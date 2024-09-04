const mongoose = require("mongoose");
const Schema = mongoose.Schema

const User = new Schema({
  firstname: { type: String, default: "",},
  lastname: { type: String, default: "" },
  username: { type: String, default: "" },
  email: { type: String, default: "", required: true },
  payout_option: { type: String, default: "" },
  iban: { type: String, default: "" },
  eth_wallet: { type: String, default: "" },
  btc_wallet: { type: String, default: "" },
  ltc_wallet: { type: String, default: "" },
  paypal_wallet: { type: String, default: "" },
  password: { type: String, default: "", required: true },
  address: { type: String, default: "" },
  city: { type: String, default: "" },
  postalcode: { type: String, default: "" },
  country: { type: String, default: "" },
  phonenumber: { type: String, default: "" },
  dateofbirth: { type: String, default: "" },
  currentbalance: { type: Number, default: 0 },
  totalearnings: { type: Number, default: 0 },
  estimatedpayout: { type: Number, default: 30 },
  accountcreated: { type: Date, default: Date.now, },
  lastlogin: Date,
  tier: { type: String, default: "starter" },
  max_products: { type: Number, default: 5 },
  verified: { type: Boolean, default: false, },
  inreview: { type: Boolean, default: true },
  emailverified: { type: Boolean, default: false },
  emailtoken: { type: String, default: "" },
  resettoken: { type: String, default: "" },
  manualreview: {type: Boolean, default: false},
  issue: { type: Boolean, default: false, },
  isAdmin: { type: Boolean, default: false },
});

// User.pre('save', async function (next) {
//   const user = this;
//   if (!user.isModified('password')) return next();

//   const salt = await bcrypt.genSalt(10);
//   const hash = await bcrypt.hash(user.password, salt);
//   user.password = hash;
//   next();
// });

// User.methods.comparePassword = async function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

module.exports = mongoose.model("User", User);
