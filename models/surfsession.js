var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var Wave     = require('./wave.js');

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

var tideDirection = ['incoming', 'outgoing'];

// Stoke options
var surfStoke = ['1', '2', '3', '4', '5'];

var SurfSession = new Schema({
  date: Date,
  duration: Number, // In minutes
  location: {
    type: Schema.ObjectId,
    ref: 'Wave'
  },
  notes: String,
  // Subjective recording of surf height
  surfHeight: {
    type: String,
    enum: surfHeights
  },
  // Relative measurment of conditions by tide, wind, swell, etc.
  surfConditions: {
    type: String,
    enum: surfConditions
  },
  // Likert scale for how much fun was, independent of conditions
  surfStoke: {
    type: String,
    enum: surfStoke
  },
  // Objective readings of NOAA buoys
  buoys: {
    timestamp: Date,
    wvht: Number, // Significant Swell Height in meters
    dpd: Number,  // Dominant wave period in seconds
    mwd: String  // direction from which the waves at (DPD) are coming
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
};

function displaySurfHeight(ht) {
  // transform enumerated abbreviation into human friendly string
}

module.exports = mongoose.model('SurfSession', SurfSession);