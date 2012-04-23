var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Buoy= new Schema({
  name: {
    type: String,
    required: true
  },
  mid: String, 
  cdipId: String,
  location: {
    lng: Number,
    lat: Number
  }
});

module.exports = mongoose.model('Buoy', Buoy);
