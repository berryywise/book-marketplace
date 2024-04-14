const requestTimeout = {};

function timeoutMiddleware(req, res, next) {
  const userId = req.user ? req.user.id : 'anonymous';
  const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  const key = `${userId}_${ipAddress}_${userAgent}_${req.method}${req.originalUrl}`;

  const currentTime = new Date().getTime();
  const lastRequestTime = requestTimeout[key] || 0;

  const timeDifference = currentTime - lastRequestTime;

  // Set a time limit (e.g., 5 seconds) between requests
  const timeLimit = 5000;

  if (timeDifference < timeLimit) {
    const remainingTime = timeLimit - timeDifference;
    return res.status(429).send(`Not so fast! Too many requests. Please wait ${remainingTime / 1000} seconds.`);
  }

  // Update the timestamp for the current request
  requestTimeout[key] = currentTime;

  next();
}

module.exports = timeoutMiddleware;