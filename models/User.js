const mongoose = require('mongoose');
const mongooseValidator = require('mongoose-unique-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const UserSchema = new mongoose.Schema({
  username: { type: String, require: true },
  email: { type: String, require: true, unique: true },
  password: { type: String, require: true, minLength: 6, select: false },
});

UserSchema.plugin(mongooseValidator);

UserSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getSignedJwt = function () {
  return jwt.sign({ id: this._id }, config.jwtSecret, {
    expiresIn: 36000000,
  });
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
