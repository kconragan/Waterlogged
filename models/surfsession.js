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
  user: {type : Schema.ObjectId, ref : 'User'},
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
  buoys: {
    timestamp: Date,
    wvht: Number,        // Significant Swell Height in meters
    dpd: Number,         // Dominant wave period in seconds
    mwd: String          // Direction from which the waves (DPD) are coming
  },
  wind: {
    speed: Number,       // The wind speed in MPH
    direction: String,   // Text label for wind direction (eg 'ESE', 'South')
    degrees: Number      // The degrees out of 360 (eg '284')
  },
  weather: {
    temperature: Number, // The temperature in farenheit
    conditions: String   // Subjective label (etc. 'clear', 'foggy')
  },
  tide: {
    height: Number,      // Tide measurement in feet
    direction: {
      type: String,      // Is the tide incoming or outgoing?
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