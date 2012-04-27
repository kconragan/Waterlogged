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

var tideDirection = [ 'incoming', 'outgoing'];

// Stoke options
var surfStoke = ['1', '2', '3', '4', '5'];

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
    type: String,
    enum: surfStoke,
    default: 3,
  },
  buoys: {
    timestamp: Date,
    wvht: Number, // Significant Swell Height
    dpd: Number,  // Dominant wave period
    mwd: String,  // direction from which the waves at (DPD) are coming
  },
  wind: {
    speed: Number,
    direction: String
  },
  tide: {
    height: Number,
    direction: {
      type: String,
      enum: tideDirection
    }
  }
});

SurfSession.methods.generateStoke = function() {
  // return a map of surfStoke values to display values
  return [
    {
      "value": 1,
      "display": "Worst session of the year"
    }, 
    {
      "value": 2,
      "display": "Not worth the paddle"
    }, 
    {
      "value": 3,
      "display": "Maintenance session"
    }, 
    {
      "value": 4,
      "display": "Stoke"
    }, 
    {
      "value": 5,
      "display": "Epic"
    }
  ];
}

module.exports = mongoose.model('SurfSession', SurfSession);
