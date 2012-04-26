var Q = require('q');
var _request = require('request');
var moment = require('moment');

var WUNDERGROUND_API_KEY = '667949632ad1cc70';

var request = function(url) {
  // Q-wrapped request function.
  // Returns request promise.
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

var getTideAndWind = function(date, location) {
  // fetch json of wind and tide from wunderground
  var date = moment(date).format('YYYYMMDD');
  var location = location.lat + ',' + location.lng;
  var root  = 'http://api.wunderground.com/api/' + WUNDERGROUND_API_KEY;
  var path = '/history_' + date + '/rawtide/q/' + location + '.json';
  var url = root + path;

  return request(url);
};

var parseTideAndWind = function(date, location) {
  // parse json of tide/wind and find best match

  var observation = {
    wind: {
      speed: null,
      direction: null
    },
    tide: {}
  };
  var sessionTime = moment(date).utc();

  return getTideAndWind(date, location).then(function(data) {


    var results = JSON.parse(data); 
    var winds = results.history.observations;

    var closestReading = null;
    var targetIndex = null;

    // iterate through wind observations and find the closet in time
    for(i=0; i < winds.length; i++) {
      var w = winds[i];

      // convert time and compare with surfsession to find closest
      var d = w.utcdate;
      var t = d.year + ':' + d.mon + ':' + d.mday + ':' + d.hour + ':' + d.min + ': +0000';
      var windTime = moment(t, 'YYYY:MM:DD:HH: +Z').utc();

      var delta = timeDelta(windTime, sessionTime);
      if(!closestReading || Math.abs(delta) < closestReading) {
        closestReading = Math.abs(delta);
        targetIndex = winds[i];
      }
    }

    // we have the closest observation time
    // pass the wind direction and speed
    console.log('session time is ', sessionTime);
    console.log('closest observation time is ', targetIndex.utcdate.pretty);
    observation.wind.speed = targetIndex.wspdi;
    observation.wind.direction = targetIndex.wdire;
    console.log(observation);

    // do the same for tide
    //var tides = results.rawTide.rawTideObs;

    return observation;
  });


}

var normalizeGeo = function(lat,long, format) {
  // return latitude longitude to specified decimal place
  var lat = lat.toFixed(format);
  // need to determine whether we're dealing with a dash (-) or not
  // before we run conversion on longitude
  var lng = lng.toFixed(format);

};

var getBuoyData = function(buoyId) {
  // return valid url for ndbc buoy id.
  var url = 'http://www.ndbc.noaa.gov/data/5day2/' + buoyId + '_5day.txt';
  return request(url);
};

var timeDelta = function(date1, date2) {
  // Compare the delta between to JavaScript Date Objects
  // Returns millis
  var date1 = moment.utc(date1);
  var date2 = moment.utc(date2);
  var delta = date1 - date2;
  return delta;
};


var parseBuoyData = function(buoy, seshDate) {
  // parse ndbc buoy readings and find best match.

  // grab raw buoy readings from NOAA
  return getBuoyData(buoy).then(function(data) {

    // CDIP data looks like this:
    // 0    1  2  3  4    5    6   7     8     9    10  11     12    13    14    15   16   17    18
    //#YY  MM DD hh mm WDIR WSPD GST  WVHT   DPD   APD MWD   PRES  ATMP  WTMP  DEWP  VIS PTDY  TIDE
    //#yr  mo dy hr mn degT m/s  m/s     m   sec   sec degT   hPa  degC  degC  degC  nmi  hPa    ft
    // transform results into array of individual buoy readings
    var results = data.split('\n').slice(0, -1).map(function(e) {
      return e.split(/ +/); 
    }).slice(2);

    // the array we'll push individual readings into
    var data = results.map(function(row) {
      // construct timestamp for raw results by simulating array of parameters
      // passed to new Date(). NOTE: month is zero indexed
      // FORMAT: YYYY,MM,DD,H,HH
      var t = [row[0], row[1] - 1, row[2], row[3], row[4]];
      var timestamp = moment(Date.UTC.apply({}, t));

      // only return the bits we're interested in
      return { 
        timestamp: timestamp._d,
        wvht: row[8],
        dpd: row[9],
        mwd: parseInt(row[11])
      }
    });

    // Iterate through individual readings and find the one
    // closet in time to the surfSession
    var closestReading = null;
    var targetIndex = null;

    for (i = 0; i < data.length; i++) {
      var delta = timeDelta(seshDate, data[i].timestamp);
      if(!closestReading || Math.abs(delta) < closestReading) {
        closestReading = Math.abs(delta);
        targetIndex = data[i];
      }
    }
    return targetIndex;
  })
};

exports.getBuoyData = getBuoyData;
exports.parseBuoyData = parseBuoyData;
exports.request = request;
exports.timeDelta = timeDelta;
exports.parseTideAndWind = parseTideAndWind;
