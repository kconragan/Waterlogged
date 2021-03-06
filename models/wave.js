var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Buoy = require('./buoy.js');

var Wave = new Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    lng: Number,
    lat: Number
  },
  buoys: [{
    type: Schema.ObjectId,
    ref: 'Buoy'
  }],
  secretSpot: {
    type: Boolean,
    default: false
  } 
});
module.exports = mongoose.model('Wave', Wave);

