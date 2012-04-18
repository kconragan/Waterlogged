var moment = require('moment');
var _request = require('request');
var Q = require('q');

// 0    1  2  3  4    5    6   7     8     9    10  11     12    13    14    15   16   17    18
//#YY  MM DD hh mm WDIR WSPD GST  WVHT   DPD   APD MWD   PRES  ATMP  WTMP  DEWP  VIS PTDY  TIDE
//#yr  mo dy hr mn degT m/s  m/s     m   sec   sec degT   hPa  degC  degC  degC  nmi  hPa    ft

var request = function(url) {
  var deferred = Q.defer();
  _request(url, function(e, r, b) {
    if (e) {
      deferred.reject(new Error(e));
    } else {
      deferred.resolve(b);
    }
  });
  return deferred.promise;
}

exports.request = request;

exports.formatDate = function(format, date) {
};

// return valid url for ndbc buoy
var getBuoyData = function(buoyId) {
  var url = 'http://www.ndbc.noaa.gov/data/5day2/' + buoyId + '_5day.txt';
  console.log("URL: ", url);
  return request(url);
};

// format raw dates extracted from NDBC buoy readings
var formatBuoyDate = function(date) {

};

exports.parseBuoyData = function(buoy) {
  // grab raw buoy readings from NOAA
  return getBuoyData(buoy).then(function(data) {
    // transform results into array of individual buoy readings
    var results = data.split('\n').slice(0, -1).map(function(e) {
      return e.split(/ +/); 
    }).slice(2);
    return results;
  }).then(function(data) {
    var tmp = [];

    for (i = 0; i < data.length; i++) {
      var row = data[i];

      // construct timestamp for raw results by simulating
      // array of parameters passed to new Date()
      // NOTE: month is zero indexed
      // FORMAT: YYYY,MM,DD,H,HH
      var t = [row[0], row[1] - 1, row[2], row[3], row[4]];
      var timestamp = moment(Date.UTC.apply({}, t));

      var reading = {
        timestamp: timestamp,
        wvht: row[8],
        dpd: row[9]
      };
      tmp.push(reading);
    }
    return tmp;
  })
};
