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
    console.log(req.body);
    var buoy = new Buoy({
      "name": req.body.wave.name
    });

    buoy.save(function(err) {
      if(err) {
        // do error handling 
        throw err;
      } 
      else {
        Buoy.find({}, function(err, buoys) {
          console.log(buoys);
          res.render('list_buoys.html', {buoys: buoys});
        });
      }
    });
};
