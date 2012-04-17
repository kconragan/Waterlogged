var moment = require('moment');
var request = require('request');

exports.formatDate = function(format, date) {
};

// Takes NDBC Buoy ID, and returns
// series of readings
var fetchBuoy = function(buoyId) {
  request('http://www.ndbc.noaa.gov/data/5day2/' + buoyId + '_5day.txt', function(err, response, body){
    if(err || response.statusCode !== 200) {
      return -1;
    }
    console.log(body); // this works
    return body; // this returns undefined
  })
};

exports.parseBuoyData = function(buoy) {
  var buoys = fetchBuoy(buoy);
  console.log(buoys);
};

