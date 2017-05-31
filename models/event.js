const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const EventSchema = new Schema({
  name: {
    type: String,
    required: [true, 'WOOT! No event name, ya craze!'],
    trim: true,
  },
  description: {
    type: String,
  },
  start: {
    type: Date,
    required: [true, 'Mate, you\'r event gotta have a start atleast...'],
  },
  end: {
    type: Date,
    required: false,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'No author? Someone gotta create the event.'],
  },
});

module.exports = mongoose.model('Event', EventSchema);
