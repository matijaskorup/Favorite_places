const express = require('express');
const router = express.Router();
const { upload } = require('../controller/upload');
const { auth } = require('../middleware/auth');

router.route('/').get(auth, upload);

module.exports = router;
