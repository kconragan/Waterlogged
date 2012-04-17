var moment = require('moment');
var request = require('request');
var Q = require('q');

// 0    1  2  3  4    5    6   7     8     9    10  11     12    13    14    15   16   17    18
//#YY  MM DD hh mm WDIR WSPD GST  WVHT   DPD   APD MWD   PRES  ATMP  WTMP  DEWP  VIS PTDY  TIDE
//#yr  mo dy hr mn degT m/s  m/s     m   sec   sec degT   hPa  degC  degC  degC  nmi  hPa    ft

exports.formatDate = function(format, date) {
};

// return valid url for ndbc buoy
var getBuoyUrl = function(buoyId) {
  return 'http://www.ndbc.noaa.gov/data/5day2/' + buoyId + '_5day.txt';
};

// format raw dates extracted from NDBC buoy readings
var formatBuoyDate = function(date) {

};

exports.parseBuoyData = function(buoy) {

  // this is the object we'll return
  var reading = {
    waveHeight: null,
    swellPeriod: null
  };

  // grab raw buoy readings from NOAA
  var buoys = Q.node(request)(getBuoyUrl(buoy)).then(function(data, err) {
    if(err) {
      throw err;
    }
    return data[0].body
  })
  .then(function(data) {
    // transform results into array of individual buoy readings
    var results = data.split('\n').slice(0, -1).map(function(e) {
      return e.split(/ +/); 
    }).slice(2);

    for(i = 0; i < results.length; i++) {
      var row = results[i];

      // construct timestamp for raw results
      // YYYY-MM-DD H:H
      var t  =row[0] + "-" + row[1] + "-" + row[2] + ' ' + row[3] + ":" + row[4]

      // TODO
      // format date an respect timezone

      // documentation says this method is slow
      // also, time appears to be getting rounded
      // see output of console.log
      var timestamp = moment(t, "YYYY-MM-DD H, HH");

      // this is faster, but ugly and some values are indexed at 0
      var foo = moment([
        row[0], // YYYY
        row[1] - 1, // MM
        row[2], // DD
        row[3], // HH
        row[4] // H
      ])
      console.log('original', t, 'format', timestamp);

    }
  }).end();
  return reading;
};
