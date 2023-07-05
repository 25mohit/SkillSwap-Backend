const jwt = require('jsonwebtoken');

const verifyUser = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: false, message: 'Unauthorized. Access token not found.' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY); 

    req.user = decodedToken;

    next();
  } catch (error) {
    return res.status(401).json({ status: false, message: 'Unauthorized. Invalid access token.' });
  }
};

module.exports = verifyUser;
