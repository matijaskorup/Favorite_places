const jwt = require('jsonwebtoken');
const User = require('../models/User');
const HttpError = require('./HttpError');
const config = require('../config/config');

exports.auth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startswith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[0];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return next(
      new HttpError('You are not authorized to access this route!', 401),
    );
  }

  try {
    let decoded = jwt.verify(token, config.jwtSecret);
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(
      new HttpError('You are not authorized to access this route!', 401),
    );
  }
};
