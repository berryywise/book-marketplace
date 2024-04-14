const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Products = new Schema({
  name: String,
  price: { type: Number, min: 1,},
  description: String,
  thumbnail: String,
  file: String,
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  owner_username: { type: String, default: "" },
  deleted: { type: Boolean, default: false },
  in_review: { type: Boolean, default: true },
  declined: { type: Boolean, default: false },
});

module.exports = mongoose.model("Products", Products);
