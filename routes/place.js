const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getPlaces,
  getPlace,
  getMyPlaces,
  createPlace,
  updatePlace,
  putComment,
  deletePlace,
  likePlace,
  unlikePlace,
} = require('../controller/place');

router
  .route('/')
  .get(getPlaces)
  .post(
    [
      check('title').not().isEmpty(),
      check('description').isLength({ min: 5 }),
      check('address').not().isEmpty(),
    ],
    auth,
    createPlace,
  );

router.route('/myplaces').get(auth, getMyPlaces);

router
  .route('/:id')
  .get(auth, getPlace)
  .patch(
    [
      check('description').isLength({ min: 5 }),
      check('address').not().isEmpty(),
    ],
    auth,
    updatePlace,
  )
  .put(
    [
      check('nickname').isLength({ min: 3 }),
      check('body').isLength({ min: 5 }),
    ],
    auth,
    putComment,
  )
  .delete(deletePlace);

router.route('/like/:id').put(auth, likePlace);
router.route('/unlike/:id').put(auth, unlikePlace);

module.exports = router;
