const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String,
});

const AdminLog = mongoose.model('AdminLog', adminLogSchema);

module.exports = AdminLog;
