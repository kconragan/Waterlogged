var Buoy = require('../models/buoy.js');
var Wave = require('../models/wave.js');
var SurfSession = require('../models/surfsession.js');

var h = require('../lib/helpers.js');
var moment = require('moment');
var Q = require('q');

var TIMEZONEOFFSET = '-8';

exports.index = function(req, res){
  res.render('index.html', { title: 'Waterlogged' })
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
          res.redirect('/buoys/' + buoy._id.toHexString())
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
  })
};

exports.getBuoy = function(req, res) {
  Buoy.findOne({ _id: req.params.id}, function(err, buoy) {
    if(err) {
      throw err;
    } 
    else {
      res.render('buoy.html', { buoy: buoy});
    }
  })
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
        res.redirect('/waves/' + wave._id.toHexString())
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
}; exports.getWave = function(req, res) { Wave.findOne({ _id: req.params.id })
      .populate('buoys')
      .run(function(err, wave) {
        if(err) {
          throw err;
        } 
        else {
          res.render('wave.html', {
            wave: wave
          })
        }
  });
};

exports.listLogs = function(req, res) {
  SurfSession.find(function(err, log){
    Wave.find(function(err, waves) {
      var surfHeight = SurfSession.schema.path('surfHeight').enumValues;
      var surfConditions = SurfSession.schema.path('surfConditions').enumValues;
      var surfStoke = SurfSession.schema.path('surfStoke').enumValues;
      console.log(surfStoke);
      res.render('list_sessions.html', { 
        title: 'Latest Surf Sessions',
        log: log,
        waves: waves,
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

  var seshDate = d.date + ':' + d.time + ':' + TIMEZONEOFFSET;
  console.log('time is ', d.time);
  seshDate = moment(seshDate, "MM-DD-YYYY:HH:mm:Z");
  console.log(seshDate);

  //Create new SurfSession and fill in relevant props
  var sesh = new SurfSession({
    date: seshDate._d,
    location: d.wave,
    duration: d.duration 
  });

  // Look up relevant buoy via the Wave ObjectId
  Wave.findOne({_id: d.wave})
      .populate('buoys', ['ndbcId'])
      .run(function(err, wave) {
        //Fetch relevant buoy data
        h.parseBuoyData(wave.buoys[0].ndbcId, seshDate).then(function(data) {
         // append to our surf session
         sesh.buoys = data;
         res.send(sesh);
         // sesh.save();
        }).end()
  });
};
