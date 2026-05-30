const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    // Step 1: Check if a token was sent with the request
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided. Please log in.' });
    }

    // Step 2: Remove the word "Bearer " from the front to get the raw token
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    // Step 3: Decode the token to find out who the user is
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 4: Attach the user's ID to the request
    req.user = decoded;

    // Step 5: Move on to the actual endpoint
    next();

  } catch (error) {
    res.status(401).json({ message: 'Invalid token. Please log in again.' });
  }
};

module.exports = protect;