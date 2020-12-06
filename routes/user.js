const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
  authUser,
  loginUser,
  logoutUser,
  getMe,
} = require('../controller/user');
const { auth } = require('../middleware/auth');

router.route('/me').get(auth, getMe);
router
  .route('/auth')
  .post(
    [
      check('username').isLength({ min: 5 }),
      check('password').isLength({ min: 6 }),
      check('email').normalizeEmail().isEmail(),
    ],
    authUser,
  );

router
  .route('/login')
  .post(
    [
      check('email').normalizeEmail().isEmail(),
      check('password').isLength({ min: 6 }),
    ],
    loginUser,
  );

router.route('/logout').get(logoutUser);

module.exports = router;
