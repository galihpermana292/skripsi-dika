const mongoose = require('mongoose');

const DataSchema = new mongoose.Schema({
  tower1: {
    type: Number,
    required: true
  },
  tower2: {
    type: Number,
    required: true
  },
  tower3: {
    type: Number,
    required: true
  },
  rssi1: {
    type: Number,
    required: true
  },
  rssi2: {
    type: Number,
    required: true
  },
  rssi3: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Data', DataSchema);
