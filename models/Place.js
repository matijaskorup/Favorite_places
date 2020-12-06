const mongoose = require('mongoose');

const PlaceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  location: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  likes: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
  ],
  comments: [
    {
      nickname: {
        type: String,
      },
      body: {
        type: String,
      },
      date: {
        type: Date,
        default: new Date(),
      },
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const Place = mongoose.model('Place', PlaceSchema);

module.exports = Place;
