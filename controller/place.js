const Place = require('../models/Place');
const HttpError = require('../middleware/HttpError');
const { validationResult } = require('express-validator');
const { getCordsForAddress } = require('../utils/getCords');

exports.getPlaces = async (req, res, next) => {
  try {
    let places = await Place.find({}).populate('user');
    if (!places) {
      return next(new HttpError('Could not find a Place!', 404));
    }
    res
      .status(200)
      .json({ places: places.map((el) => el.toObject({ getters: true })) });
  } catch (err) {
    return next(err);
  }
};

exports.getMyPlaces = async (req, res, next) => {
  try {
    let places = await Place.find({ user: req.user.id });
    if (!places) {
      return next(new HttpError('Could not find a place!', 404));
    }
    res
      .status(200)
      .json({ places: places.map((el) => el.toObject({ getters: true })) });
  } catch (err) {
    return next(new HttpError('Error fetching places!', 500));
  }
};

exports.getPlace = async (req, res, next) => {
  let place;
  try {
    place = await Place.findById(req.params.id);
    if (!place) {
      return next(new HttpError('Place not found!', 404));
    }
    res.status(200).json({ place: place.toObject({ getters: true }) });
  } catch (err) {
    console.log(err);
    return next(new HttpError('Find Place Error!', 500));
  }
};

exports.createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid input passed! Try again!', 422));
  }
  const { title, description, image, address } = req.body;
  let coord;
  try {
    coord = await getCordsForAddress(address);
  } catch (err) {
    return next(err);
  }
  let placeToSave = new Place({
    title,
    description,
    image,
    address,
    location: coord,
    user: req.user.id,
  });
  try {
    await placeToSave.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError('Could not save a place!', 500));
  }
  res.status(201).json({ place: placeToSave.toObject({ getters: true }) });
};

exports.updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Please provide a valid Information!', 422));
  }
  const { description, address } = req.body;
  let coord;
  try {
    coord = await getCordsForAddress(address);
  } catch (err) {
    return next(err);
  }

  let place;
  try {
    place = await Place.findById(req.params.id);
    place.description = description;
    place.address = address;
    place.location = coord;
    await place.save();
  } catch (error) {
    return next('Could not find a place with given id!', 404);
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

exports.putComment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Please provide a valid Information!', 422));
  }
  const { nickname, body } = req.body;
  let place;
  try {
    place = await Place.findById(req.params.id);
  } catch (err) {
    console.log(err);
    return next(new HttpError('Could not find a place with given id!', 404));
  }
  let comment = {
    nickname,
    body,
  };
  try {
    place.comments.push(comment);
    await place.save();
  } catch (err) {
    console.log(err);
    return next(new HttpError('Could not save a place!', 500));
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

exports.deletePlace = async (req, res, next) => {
  try {
    await Place.findByIdAndDelete(req.params.id);
  } catch (err) {
    console.log(err);
    return next(new HttpError('Could not delete a place!', 500));
  }
  res.status(200).json({ message: 'Place Deleted!' });
};

exports.likePlace = async (req, res, next) => {
  try {
    let post = await Place.findById(req.params.id);
    if (!post) {
      return next(new HttpError('Post with given id not found!', 404));
    }
    if (post.likes.some((el) => el.user == req.user.id)) {
      return next(new HttpError('Post aleredy liked!', 400));
    }
    post.likes.push({ user: req.user.id });
    await post.save();
    res.status(200).json(post.likes);
  } catch (err) {
    console.log(err);
    return next(new HttpError('Something went wrong!', 500));
  }
};

exports.unlikePlace = async (req, res, next) => {
  try {
    let place = await Place.findById(req.params.id);
    if (!place) {
      return next(new HttpError('Place not found!', 404));
    }
    if (place.likes.filter((el) => el.user == req.user.id).length === 0) {
      return next(new HttpError('Place has not yet been liked!', 400));
    }

    const removeIndex = place.likes
      .map((el) => el.user.toString())
      .indexOf(req.user.id);

    place.likes.splice(removeIndex, 1);

    await place.save();
    res.status(200).json(place.likes);
  } catch (err) {
    console.log(err);
    return next(new HttpError('Something went wrong!', 500));
  }
};
