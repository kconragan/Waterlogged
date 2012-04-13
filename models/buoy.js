var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Buoy= new Schema({
  name: {
    type: String,
    required: true
  },
  mid: String, 
  cdip_id: String,
  ndbc_id: String,
  location: {
    lng: Number,
    lat: Number
  }
});

module.exports = mongoose.model('Buoy', Buoy);
