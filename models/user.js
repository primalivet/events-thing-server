const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'username is required'],
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'password is required'],
    select: false,
  },
  admin: Boolean,
});

UserSchema.virtual('events', {
  ref: 'Event',
  localField: '_id',
  foreignField: 'author',
});

module.exports = mongoose.model('User', UserSchema);
