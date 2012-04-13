var Buoy = require('../models/buoy.js');
var Wave = require('../models/wave.js');

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
      "name": req.body.wave.name,
      "location": {
        "lng": req.body.wave.location.lng,
        "lat": req.body.wave.location.lat
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
