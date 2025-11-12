const jwt = require('jsonwebtoken');

// Get the secret from your auth.js (you should move this to a .env file later)
const JWT_SECRET = 'your-super-secret-key-12345'; // Must match your auth.js

module.exports = function (req, res, next) {
  // Get token from the header
  const authHeader = req.header('Authorization');

  // Check if no token
  if (!authHeader) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // The token comes as "Bearer <token>"
  const token = authHeader.split(' ')[1];

  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Add the user payload to the request object
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};