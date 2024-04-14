const AdminLog = require('../models/adminLog');

async function adminLogger(req, res, next) {
  try {
    const logEntry = {
      userId: req.user._id,
      action: 'Settings Updated', 
    };

    // Save the log entry to the database
    await AdminLog.create(logEntry);

    next();
  } catch (error) {
    console.error('Error saving admin log:', error);
    next();
  }
}

module.exports = adminLogger;