var moment = require('moment');
var request = require('request');
var Q = require('q');

exports.formatDate = function(format, date) {
};

// return valid url for ndbc buoy
var getBuoyUrl = function(buoyId) {
  return 'http://www.ndbc.noaa.gov/data/5day2/' + buoyId + '_5day.txt';
};

exports.parseBuoyData = function(buoy) {
  var buoys = Q.node(request)(getBuoyUrl(buoy)).then(function(data, err) {
    if(err) {
      throw err;
    }
    console.log("Buoys: ", data[0].body);
  }).end();
};
