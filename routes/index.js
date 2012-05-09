var Buoy = require('../models/buoy.js');
var Wave = require('../models/wave.js');
var SurfSession = require('../models/surfsession.js');

var h = require('../lib/helpers.js');
var moment = require('moment');
var Q = require('q');

var TIMEZONEOFFSET = '-8';

exports.index = function(req, res){
  res.render('index.html', { title: 'Waterlogged' });
};

exports.listBuoys = function(req, res) {
  Buoy.find(function(err, buoys){
    res.render('list_buoys.html', { title: 'Buoys', buoys: buoys });
  });
};

exports.createBuoy = function(req, res) {
    var buoy = new Buoy({
      'name': req.body.buoy.name,
      'location': {
        'lng': req.body.buoy.location.lng,
        'lat': req.body.buoy.location.lat
      }
    });

    buoy.save(function(err) {
      if(err) {
        // do error handling
        throw err;
      }
      else {
        Buoy.findOne({_id: buoy.id }, function(err, buoy) {
          res.redirect('/buoys/' + buoy._id.toHexString());
        });
      }
    });
};

exports.deleteBuoy = function(req, res) {
  Buoy.findOne({ _id: req.params.id}, function(err, buoy){
    if(err) {
      throw err;
    }
    else {
      // TODO: find all Waves that reference this buoy and delete accordingly
      buoy.remove(function() {
        res.redirect('/buoys');
      });
    }
  });
};

exports.getBuoy = function(req, res) {
  Buoy.findOne({ _id: req.params.id}, function(err, buoy) {
    if(err) {
      throw err;
    }
    else {
      res.render('buoy.html', { buoy: buoy});
    }
  });
};

exports.getBuoyReading = function(req, res) {
  var ndbcId   = req.params.id.toString();
  var year     = req.params.year;
  var month    = req.params.month;
  var day      = req.params.day;
  var hour     = req.params.time;
  var buoyTime = moment(year + '-' + month + '-' + day + '-' + hour);
  h.parseBuoyData(ndbcId, buoyTime).then(function(data) {
    res.send(data);
  });
};

exports.listWaves = function(req, res) {
  Wave.find(function(err, waves){
    Buoy.find(function(err, buoys) {
      res.render('list_waves.html', {
        title: 'Waves',
        waves: waves,
        buoys: buoys
      });
    });
  });
};

exports.createWave = function(req, res) {
  var w = req.body.wave;

  // construct base properties for new Wave
  var wave = new Wave({
    'name': w.name,
    'location': {
      'lng': w.location.lng,
      'lat': w.location.lat
    },
    'buoys': w.buoys
  });

  wave.secretSpot = w.secretSpot ? true : false;

  wave.save(function(err) {
    // TODO: better error handling
    if(err) {
      throw err;
    }
    else {
      Wave.findOne({ _id: wave.id }, function(err, wave) {
        res.redirect('/waves/' + wave._id.toHexString());
      });
    }
  });
};

exports.deleteWave = function(req, res) {
  Wave.findOne({ _id: req.params.id}, function(err, wave){
    // TODO: better error handling
    if(err) {
      throw err;
    }
    else {
      // TODO: find all SurfSessions that reference this wave and delete accordingly
      wave.remove(function() {
        res.redirect('/waves');
      });
    }
  });
};

exports.getWave = function(req, res) {
  Wave.findOne({ _id: req.params.id })
      .populate('buoys')
      .run(function(err, wave) {
        if(err) {
          throw err;
        }
        else {
          res.render('wave.html', {
            wave: wave
          });
        }
  });
};

exports.listLogs = function(req, res) {
  SurfSession.find()
    .populate('location')
    .run(function(err, log) {
      // Get stuff required for building surf session form
      Wave.find(function(err, waves) {
        var surfHeight = SurfSession.schema.path('surfHeight').enumValues;
        var surfConditions = SurfSession.schema.path('surfConditions').enumValues;
        var surfStoke = new SurfSession().generateStoke();
        var currentYear = moment().year();
        var surfSessionsThisYear = 0;

        // Object for mapping surf sessions to locations by count
        var surfSeshByLoc = {};
        waves.forEach(function(w) {
          surfSeshByLoc[w.name] = 0;
        });

        // find number of sessions for current year
        // and build map of sessions by wave
        for(var i = 0; i < log.length; i++) {
          var y = moment(log[i].date).year();
          if(y === currentYear) {
            surfSessionsThisYear++;
          }
          var l = log[i].location.name;
          surfSeshByLoc[l] = surfSeshByLoc[l] + 1;
        }
        res.render('list_sessions.html', {
          title: 'Latest Surf Sessions',
          log: log,
          waves: waves,
          surfSessionsThisYear: surfSessionsThisYear,
          allSurfSessions: log.length,
          surfSeshByLoc: surfSeshByLoc,
          surfHeight: surfHeight,
          surfConditions: surfConditions,
          surfStoke: surfStoke
        });
      });
    });
};

// Construct a SurfSession object and save
exports.createSesh = function(req, res) {

  var d = req.body;
  console.log(d);

  var seshDate = d.date + ':' + d.time;
  seshDate = moment(seshDate, "MM-DD-YYYY:HH:mm");
  console.log('the surf session occurred in the following timezone ', seshDate.zone());

  //Create new SurfSession and fill in relevant props
  var sesh = new SurfSession({
    date: seshDate._d,
    location: d.wave
  });

  if(d.duration) {
    sesh.duration = d.duration;
  }
  if(d.surfHeight) {
    sesh.surfHeight = d.surfHeight;
  }
  if(d.surfConditions) {
    sesh.surfConditions = d.surfConditions;
  }
  if(d.surfStoke) {
    sesh.surfStoke = d.surfStoke;
  }
  if(d.notes) {
    sesh.notes = d.notes;
  }

  var waveLocation = {};

  console.log(sesh);

  // Look up relevant buoy via the Wave ObjectId
  Wave.findOne({_id: d.wave})
      .populate('buoys', ['ndbcId'])
      .run(function(err, wave) {

        // fill in wave location for later reference
        waveLocation.lng = wave.location.lng;
        waveLocation.lat = wave.location.lat;

        //Fetch relevant buoy data and append to surf session
        h.parseBuoyData(wave.buoys[0].ndbcId, seshDate).then(function(data) {
          console.log('buoy data is ', data);
          if(data) {
           sesh.buoys = data;
          }
        })
       // fetch tide/winds from wunderground
      .then(function() {
        h.parseTideAndWind(sesh.date, waveLocation).then(function(data) {
          if(data.wind) {
            sesh.wind = data.wind;
          }
          if(data.weather) {
            sesh.weather = data.weather;
          }
          console.log('the session before saving is ', sesh);
          // Save new session and redirect
          sesh.save(function(err) {
            // TODO: better error handling
            if(err) {
              throw err;
            }
            else {
              SurfSession.findOne({ _id: sesh.id }, function(err, sesh) {
                res.redirect('/logs/' + sesh._id.toHexString());
              });
            }
          });
        });
      }).end();
  });
};

exports.getLog = function(req, res) {
  SurfSession
    .findOne({ _id: req.params.id})
    .populate('location')
    .run(function(err, sesh) {
      if(err) {
        throw err;
      }
      else {
        sesh.buoys.wvht = h.convertMetersToFeet(sesh.buoys.wvht, 1);
         var seshDate = moment(new Date(sesh.date)).format('h:mm a dddd, MMMM Do, YYYY z');
         sesh.friendlyDate = seshDate;
        if (sesh.tide.height) {
          sesh.tide.height = sesh.tide.height.toFixed(2);
        }
        res.render('sesh.html', { sesh: sesh });
      }
    });
};

exports.updateSeshData = function(req, res) {
  SurfSession
    .findOne({ _id: req.params.id})
    .populate('location')
    .run(function(err, sesh) {
      if(err) {
        throw err;
      }
      else {
        var surfSession = sesh;
        var buoyId = surfSession.location.buoys;
        Buoy.findOne({ _id: buoyId }).run(function(err, buoy) {
          var ndbcId   = buoy.ndbcId;
          var seshTime = moment(surfSession.date);
          var year     = seshTime.year();
          var month    = seshTime.month();
          var day      = seshTime.date();
          var hour     = seshTime.hours() + ':' + seshTime.minutes();
          var buoyTime = moment(new Date(surfSession.date));

          h.parseBuoyData(ndbcId, buoyTime).then(function(data) {
            console.log(req.body.ajax);
            if(req.body.ajax === 'true') {
              console.log('ajax response');
              res.send(data);
            }
            else {
              console.log('non-ajax response');
            }
          });
        });
      }
  });
};

exports.deleteLog = function(req, res) {
  SurfSession.findOne({ _id: req.params.id}, function(err, sesh){
    // TODO: better error handling
    if(err) {
      throw err;
    }
    else {
      // TODO: find all SurfSessions that reference this wave and delete accordingly
      sesh.remove(function() {
        res.redirect('/logs');
      });
    }
  });
};