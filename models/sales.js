const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Sales = new Schema({
  buyername: String,
  product: { type: Schema.Types.ObjectId, ref: "Products", required: true},
  solddate: String,
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true},
  owner_username: { type: String, default: ""},
}, { timestamps: true });

module.exports = mongoose.model("Sales", Sales);
