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
  return request(url);
};

// Compare the delta between to JavaScript Date Objects
var compareTimeDelta = function(date1, date2) {

  var date1 = moment.utc(date1);
  var date2 = moment.utc(date2);

  return delta = date1 - date2;

};

exports.compareTimeDelta = compareTimeDelta;

var parseBuoyData = function(buoy) {

  // grab raw buoy readings from NOAA
  return getBuoyData(buoy).then(function(data) {
    // transform results into array of individual buoy readings
    var results = data.split('\n').slice(0, -1).map(function(e) {
      return e.split(/ +/); 
    }).slice(2);
    return results;
  }).then(function(data) {

    // return array of objects of just the data we want

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
  }).then(function(data) {

    // temporary date to compare against
    var seshDate = moment(new Date()).subtract('days', 1);
    var closestReading = null;
    var closestIndex = null;

    for (i = 0; i < data.length; i++) {

      var delta = compareTimeDelta(seshDate, data[i].timestamp);
      if(!closestReading || Math.abs(delta) < closestReading) {
        closestReading = Math.abs(delta);
        closetIndex = i;
      }
      
    }

    console.log('session date is ', seshDate);
    console.log('closest reading is ', data[closetIndex]);

    return data;
  })
};

exports.parseBuoyData = parseBuoyData;
