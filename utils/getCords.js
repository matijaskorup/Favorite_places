const config = require('../config/config');
const axios = require('axios');
const HttpError = require('../middleware/HttpError');

exports.getCordsForAddress = async (address, next) => {
  //google geocoding api
  let response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address,
    )}&key=${config.GoogleApyKey}`,
  );
  let data = response.data;
  if (!data || data.status === 'ZERO_RESULTS') {
    return next(
      new HttpError('Could not find location for the specified address!', 422),
    );
  }
  let coordinates = data.results[0].geometry.location;
  return coordinates;
};
