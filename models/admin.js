const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Admin = new Schema({
  user: [{ type: Schema.Types.ObjectId, ref: "User", default: 0 }],
  max_product_price: { type: Number, default: 30 },
  max_product_limit: { type: Number, default: 5 },
  max_sales_day: { type: Number, default: 10 },
  sales_are_running: { type: Boolean, default: false },
  products_in_review: { type: Number, default: 0 },
  admin_review_days: { type: Number, default: 14  },
  cron_schedule: { type: String, default: "0 3 * * *" },
  cron_sale_day: { type: String, default: "0 3 * * *" },
  cron_sale_min: { type: String, default: "*/2 * * * *" },
  min_time: { type: Number, default: 1 },
  max_time: { type: Number, default: 8 },
  timer_current_settings: { type: Number, default: 3600000 },
  timer_minutes: { type: Number, default: 60000 },
  timer_hours: { type: Number, default: 3600000 },

});

module.exports = mongoose.model("Admin", Admin);
