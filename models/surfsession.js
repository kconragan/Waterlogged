var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Wave = require('./wave.js');

// Surf height options
var surfHeights = [
  'WH',
  'WH-CH',
  'CH',
  'CH-HH',
  'HH',
  'HH-OH',
  'OH',
  'OH+',
  'DOH'
];

// Condition options
var surfConditions = [
  'Poor',
  'Poor+',
  'Fair-',
  'Fair',
  'Fair+',
  'Good-',
  'Good',
  'Good+'
];

// Stoke options
var surfStoke = [
  {
    value: 1,
    display: 'Worst session of the year',
  },
  {
    value: 2,
    display: 'Not worth the paddle',
  },
  {
    value: 3,
    display: 'Maintenance session',
  },
  {
    value: 4,
    display: 'Stoked',
  },
  {
    value: 4,
    display: 'Epic',
  },
];

var SurfSession = new Schema({
  date: Date,
  duration: Number,
  location: Schema.ObjectId,
  notes: String,
  surfHeight: {
    type: String,
    enum: surfHeights,
    default: 'CH',
  },
  surfConditions: {
    type: String,
    enum: surfConditions,
    default: 'Fair',
  },
  surfStoke: {
    type: Number,
    enum: surfStoke,
    default: 3,
  },
  buoys: {
    timestamp: Date,
    wvht: Number, // Significant Swell Height
    dpd: Number,  // Dominant wave period
    mwd: String,  // direction from which the waves at (DPD) are coming
  },
});

module.exports = mongoose.model('SurfSession', SurfSession);
