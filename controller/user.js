const { validationResult } = require('express-validator');
const User = require('../models/User');
const HttpError = require('../middleware/HttpError');

const tokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwt();
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token });

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }
};

exports.getMe = async (req, res, next) => {
  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return next(new HttpError('User not found!', 404));
    }
    res.status(200).json({ user: user.toObject({ getters: true }) });
  } catch (err) {
    console.log(err);
    return next(new HttpError('Finding user error!', 500));
  }
};

exports.authUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Please provide a valid Information!', 422));
  }
  const { username, email, password } = req.body;

  let user = await User.findOne({ email });
  if (user) {
    return next(new HttpError('User aleredy exist!', 403));
  }
  try {
    user = await User.create({
      username,
      email,
      password,
    });
  } catch (err) {
    return next(new HttpError('Could not save the user!', 500));
  }
  tokenResponse(user, 200, res);
};

exports.loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Please provide a valid Information!', 422));
  }
  const { email, password } = req.body;
  let user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new HttpError('User does not exist!', 404));
  }

  let isMatch;
  try {
    isMatch = await user.comparePassword(password);
  } catch (err) {
    return next(new HttpError('Invalid password!', 401));
  }

  tokenResponse(user, 200, res);
};

exports.logoutUser = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
  } catch (err) {
    return next(new HttpError('Logout Error!', 500));
  }

  res.status(200).json({
    success: true,
    data: {},
  });
};
