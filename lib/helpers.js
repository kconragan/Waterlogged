var Q        = require('q');
var _request = require('request');
var moment   = require('moment');

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
};

var getTideAndWind = function(date, location) {

  // fetch json of wind and tide from wunderground
  var fetchDate = moment(date).format('YYYYMMDD');
  var loc       = location.lat + ',' + location.lng;
  var root      = 'http://api.wunderground.com/api/' + WUNDERGROUND_API_KEY;
  var path      = '/history_' + fetchDate + '/rawtide/q/' + loc + '.json';
  var url       = root + path;

  return request(url);

};

var parseTideAndWind = function(date, location) {
  // parse json of tide/wind and find best match

  // this is ultimately what we want to return
  var observation = {
    wind: {
      speed: null,
      direction: null
    },
    tide: {
      height: null,
      direction: null
    }
  };

  // the recorded time of the surf session
  var sessionTime = moment(date).utc();

  // fetch tide/wind readings from wunderground
  return getTideAndWind(date, location).then(function(data) {

    var results = JSON.parse(data);
    console.log(data);

    // if we didn't get any data, return empty object
    if(!results) {
      console.log('did not receive data, returning empty');
      return observation;
    }

    var winds = results.history.observations;
    if(winds.length) {

      console.log('we have winds');
    
      // iterate through wind observations and find the closet in time

      var smallestWindDelta = null; // smallest delta in millis
      var closestWindObs = null;    // the closest reading
      for(i=0; i < winds.length; i++) {
        var w = winds[i];

        // convert time and compare with surfsession to find closest
        // Note, date is already utc
        var d = w.utcdate;
        var t = d.year + ':' + d.mon + ':' + d.mday + ':' + d.hour + ':' + d.min + ': +0000';
        var windTime = moment(t, 'YYYY:MM:DD:HH: +Z').utc();

        var delta = timeDelta(windTime, sessionTime);
        if(!smallestWindDelta || Math.abs(delta) < smallestWindDelta) {
          smallestWindDelta = Math.abs(delta);
          closestWindObs = winds[i];
        }
      }

      observation.wind.speed = closestWindObs.wspdi;
      observation.wind.direction = closestWindObs.wdire;

    }
    else {
      console.log('did not receive wind data');
    }

    // do the same for tide
    var tides = results.rawtide.rawTideObs;
    if(tides.length) {

      var smallestTideDelta = null; // smallest delta in millis
      var closestTideObs = null;    // the closest reading in the array
      var tideIndex = null;         // position of closestTideObs in array

      for(i=0; i < tides.length; i++) {
        var tideDate = moment(tides[i].epoch * 1000);
        var tideDelta = timeDelta(sessionTime, tideDate);

        if(!smallestTideDelta || Math.abs(tideDelta) < smallestTideDelta) {
          smallestTideDelta = Math.abs(tideDelta);
          closestTideObs = tides[i];
          tideIndex = i;
        }

      }
      observation.tide.height = closestTideObs.height;
    }
    else {
      console.log('did not receive tide data');
      return observation;
    }

    // determine if tide is incoming or outgoing
    // TODO: make sure we're not at the last item in array
    if(tides[tideIndex+1].height < observation.tide.height) {
      console.log('tide is outgoing', tides[tideIndex+1].height);
      observation.tide.direction = 'outgoing';
    }
    else {
      console.log('tide is incoming', tides[tideIndex+1].height);
      observation.tide.direction = 'incoming';
    }

    return observation;
  });
};

var normalizeGeo = function(lat,long, format) {
  // return latitude longitude to specified decimal place
  var latitude = lat.toFixed(format);
  // need to determine whether we're dealing with a dash (-) or not
  // before we run conversion on longitude
  var longitude = lng.toFixed(format);

};

var getBuoyData = function(buoyId) {
  // TODO: NOAA provides two different URLs for this data
  // both returning data in the same format: a 45 day reading
  // and a 5 day reading. We should compare the surfSession date to
  // to the time of the query, and decide which URL to call.
  // The assumption is that the 5 day service will be faster.
  // Also, if the session date is > 45 days out, this method won't work at all

  // return valid url for ndbc buoy id.
  var url = 'http://www.ndbc.noaa.gov/data/5day2/' + buoyId + '_5day.txt';
  return request(url);
};

var timeDelta = function(date1, date2) {
  // Compare the delta between to JavaScript Date Objects
  // Returns millis
  var dateA = moment.utc(date1);
  var dateB = moment.utc(date2);
  var delta = dateA - dateB;
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
        mwd: parseInt(row[11], 10)
      };
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
  });
};

/**
 * Convert meters into feet.
 *
 * @param {Number} m -> The number to convert
 * @param {Number} d -> Optional decimal place to which to round
 */
var convertMetersToFeet = function(m, d) {
  var roundTo = d || 2;
  return (m * 3.2808399).toFixed(roundTo);
};

exports.getBuoyData = getBuoyData;
exports.parseBuoyData = parseBuoyData;
exports.request = request;
exports.timeDelta = timeDelta;
exports.parseTideAndWind = parseTideAndWind;
exports.convertMetersToFeet = convertMetersToFeet;