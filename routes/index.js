var Buoy = require('../models/buoy.js');
var Wave = require('../models/wave.js');
var SurfSession = require('../models/surfsession.js');

var h = require('../lib/helpers.js');

console.log(Buoy, Wave);

exports.index = function(req, res){
  res.render('index.html', { title: 'Express' })
};

exports.listBuoys = function(req, res) {
  Buoy.find(function(err, buoys){
    console.log(buoys);
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
    console.log(buoy);

    buoy.save(function(err) {
      if(err) {
        // do error handling 
        throw err;
      } 
      else {
        Buoy.findOne({_id: buoy.id }, function(err, buoy) {
          console.log(buoy);
          res.redirect('/buoys/' + buoy._id.toHexString())
        });
      }
    });
};

exports.getBuoy = function(req, res) {
  console.log(req.params.id);
  Buoy.findOne({ _id: req.params.id}, function(err, buoy) {
    if(err) {
      throw err;
    } 
    else {
      console.log(buoy);
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
  console.log(req.body);
  var wave = new Wave({
    'name': req.body.wave.name,
    'location': {
      'lng': req.body.wave.location.lng,
      'lat': req.body.wave.location.lat
    },
    'buoys': req.body.wave.closest_buoy
  })
  wave.save(function(err) {
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

exports.getWave = function(req, res) {
  Wave.findOne({ _id: req.params.id })
      .populate('buoys')
      .run(function(err, wave) {
        if(err) {
          throw err;
        } 
        else {
          console.log(wave);
          res.render('wave.html', {
            wave: wave
          })
        }
  });
};

exports.listLogs = function(req, res) {
  SurfSession.find(function(err, log){
    Wave.find(function(err, waves) {
      res.render('list_sessions.html', { 
        title: 'Latest Surf Sessions',
        log: log,
        waves: waves,
      });
    });
  });
};

exports.createSesh = function(req, res) {
  console.log(req.body);
  var buoyId = '46237';
  var seshDate = h.formatDate(req.body.date, req.body.time);
  var buoyReading = h.parseBuoyData(buoyId);
  var sesh = new SurfSession({
  
  });
};
