var Q        = require('q');
var _request = require('request');
var moment   = require('moment');

var WUNDERGROUND_API_KEY = '667949632ad1cc70';

moment.monthsShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

/*
 * Internal: Convert the request for a url into a promise
 *
 * url - the String to fetch
 *
 * Example: return request('http://www.google.com')
 *
 * Returns a promise
 */
var request = function(url) {
  // Q-wrapped request function.
  // Returns request promise.
  var deferred = Q.defer();
  _request(url, function(e, r, b) {
    if (e) {
      deferred.reject(new Error(e));
    } else {
      deferred.resolve(r,b);
    }
  });
  return deferred.promise;
};

/*
 * Internal: Fetch json from wunderground with tide/wind data
 *
 * date     - A Date for when we want to fetch results
 * location - A Object with lat/lng coordinates
 *
 * Returns a promise for a json response
 */
var getTideAndWind = function(date, location) {
  // fetch json of wind and tide from wunderground
  var fetchDate = moment(date).format('YYYYMMDD');
  var loc       = location.lat + ',' + location.lng;
  var root      = 'http://api.wunderground.com/api/' + WUNDERGROUND_API_KEY;
  var path      = '/history_' + fetchDate + '/q/' + loc + '.json';
  var url       = root + path;
  return request(url);
};

var parseTideAndWind = function(date, location) {
  // parse json of tide/wind and find best match

  // this is ultimately what we want to return
  var observation = {
    wind: {
      speed: null,
      direction: null,
      degrees: null
    },
    weather: {
      temperature: null,
      conditions: null
    }
    // tide: {
    //   height: null,
    //   direction: null
    // }
  };

  // the recorded time of the surf session
  var sessionTime = moment(date);

  // fetch tide/wind readings from wunderground
  return getTideAndWind(date, location).then(function(data) {

    var results = JSON.parse(data.body);

    // if we didn't get any data, return empty object
    if(!results) {
      console.log('did not receive data, returning empty');
      return observation;
    }

    var winds = results.history.observations;
    if(winds.length) {

      // iterate through wind observations and find the closet in time

      var smallestWindDelta = null; // smallest delta in millis
      var closestObservation = null;    // the closest reading
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
          closestObservation    = winds[i];
        }
      }

      observation.wind.speed          = closestObservation.wspdi;
      observation.wind.direction      = closestObservation.wdire;
      observation.wind.degrees        = closestObservation.wdird;
      observation.weather.temperature = closestObservation.tempi;
      observation.weather.conditions  = closestObservation.conds;

    }
    else {
      console.log('did not receive wind data');
    }

    /*
     * TODO: Clean-up below. We need to find a reliable source for tides
     * that allows us to do historical lookups
     */

    // // do the same for tide
    // var tides = results.rawtide.rawTideObs;
    // if(tides.length) {

    //   var smallestTideDelta = null; // smallest delta in millis
    //   var closestTideObs = null;    // the closest reading in the array
    //   var tideIndex = null;         // position of closestTideObs in array

    //   for(i=0; i < tides.length; i++) {
    //     var tideDate = moment(tides[i].epoch * 1000).utc();
    //     var tideDelta = timeDelta(sessionTime, tideDate);

    //     if(!smallestTideDelta || Math.abs(tideDelta) < smallestTideDelta) {
    //       smallestTideDelta = Math.abs(tideDelta);
    //       closestTideObs = tides[i];
    //       tideIndex = i;
    //     }

    //   }
    //   observation.tide.height = closestTideObs.height;
    // }
    // else {
    //   console.log('did not receive tide data');
    //   return observation;
    // }

    // determine if tide is incoming or outgoing
    // TODO: make sure we're not at the last item in array
    // if(tides[tideIndex+1].height < observation.tide.height) {
    //   console.log('tide is outgoing', tides[tideIndex+1].height);
    //   observation.tide.direction = 'outgoing';
    // }
    // else {
    //   console.log('tide is incoming', tides[tideIndex+1].height);
    //   observation.tide.direction = 'incoming';
    // }

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

var timeDelta = function(date1, date2) {
  // Compare the delta between to JavaScript Date Objects
  // Returns millis
  console.log(date1, date2);
  var dateA = moment(date1);
  var dateB = moment(date2);
  console.log(dateA, dateB);
  var delta = dateA - dateB;
  return delta;
};

/**
 * Internal: return a promise for .txt file of buoy readings from NOAA
 *
 * buoy           -> A String representing a NDBC buoy identifier
 * timeOfInterest -> A Date for when we want the buoy reading
 */
var getBuoyData = function(buoyId, timeOfInterest) {

  var now = moment();
  var comparedTo = moment(timeOfInterest);
  var url = 'http://google.com'; // this is a hack

  console.log('our interest date is ', comparedTo.year);

  // find out the difference between today and the requested date
  // we use this to determine which txt file to call from NOAA
  var difference = now.diff(comparedTo, 'days');

  // use the 5-day data
  if(difference <= 5) {
    url = 'http://www.ndbc.noaa.gov/data/5day2/' + buoyId + '_5day.txt';
    console.log(url);
    console.log('use the 5 day data');
  }
  // use the 45-day data
  else if(difference > 5 && difference <=45) {
    console.log('use the 45-day data');
    url = 'http://www.ndbc.noaa.gov/data/realtime2/' + buoyId + '.txt';
  }
  // use the stdmet monthly data (only calculated at the *end* of each month)
  else if (difference > 45 && now.year() === comparedTo.year()) {
    console.log('use the met data which is confusing at best');
    var month = moment.monthsShort[comparedTo.month()];
    url = 'http://www.ndbc.noaa.gov/data/stdmet/' + month + '/' + buoyId + '.txt';
  }
  // use yearly archives going back to 2007
  else if( now.year() > comparedTo.year() && comparedTo.year() > 2006) {
    var year = moment(timeOfInterest).year();
    url = 'http://www.ndbc.noaa.gov/view_text_file.php?filename=' + buoyId + 'h' + year + '.txt.gz&dir=data/historical/stdmet/';
    console.log('fetch yearly data', url);
  }
  return url;
};


/**
 * Internal: Iterate through array of buoys and find closest reading by time
 *
 * surfDate     - A moment
 * readings - An Array of buoy reading objects
 *
 * Examples
 *
 * compareBuoyReadings('46237', moment('1 January 2012 00:00:00'));
 *
 * Returns an Object with the following structure:
 *
 * {
 *  timestamp: "2012-03-15T07:10:00.000Z",
 *  wvht: "2.1",
 *  dpd: "12",
 *  mwd: 254
 * }
 */
var compareBuoyReadings = function(surfDate, readings) {
  // Iterate through individual readings and find the one
  // closet in time to the surfSession
  var closestReading = null;
  var targetIndex = null;

  for (var i = 0; i < readings.length; i++) {
    var delta = timeDelta(surfDate, readings[i].timestamp);
    if(!closestReading || Math.abs(delta) < closestReading) {
      closestReading = Math.abs(delta);
      targetIndex = readings[i];
    }
  }
  console.log('the closest reading is', targetIndex);
  return targetIndex;
};

/**
 * Internal: Parse buoy data returned from NOAA
 *
 * buoy     - A String representing a NDBC buoy identifier (eg. 46237)
 * seshDate - A Date for when we want the buoy reading
 *
 * Examples
 *
 * parseBuoyData('46237', moment('1 January 1970 00:00:00'));
 *
 * Returns an Object with the following structure:
 *
 * {
 *  timestamp: "2012-03-15T07:10:00.000Z",
 *  wvht: "2.1",
 *  dpd: "12",
 *  mwd: 254
 * }
 */
var parseBuoyData = function(buoy, seshDate) {
  // parse ndbc buoy readings and find best match.

  console.log(seshDate);

  var url = getBuoyData(buoy, seshDate);

  // grab raw buoy readings from NOAA
  return request(url).then(function(data) { // how to handle a null response

    if(data.request.uri.host !== 'www.ndbc.noaa.gov') {
      return null;
    }

    // transform results into array of individual buoy readings
    var results = data.body.split('\n').slice(0, -1).map(function(e) {
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

    var bestReading = compareBuoyReadings(seshDate, data);

    return bestReading;
  });
};

/**
 * Internal: Convert meters into feet.
 *
 * m - The Number to convert
 * d - The Number of places to which to round the decimal
 *
 * Examples
 *
 * convertMetersToFeet(1.37, 3);
 *
 * Returns
 *
 * A Number coverted to feet, rounded to the specified decimal place
 */
var convertMetersToFeet = function(m, d) {
  var roundTo = d || 2;
  return (m * 3.2808399).toFixed(roundTo);
};

/**
 * These are the functions we export
 */
exports.getBuoyData = getBuoyData;
exports.compareBuoyReadings = compareBuoyReadings;
exports.parseBuoyData = parseBuoyData;
exports.request = request;
exports.timeDelta = timeDelta;
exports.parseTideAndWind = parseTideAndWind;
exports.convertMetersToFeet = convertMetersToFeet;