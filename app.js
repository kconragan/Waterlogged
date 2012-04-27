
/**
 * Module dependencies.
 */

var express = require('express');
var mongoose = require('mongoose');
var routes  = require('./routes');
var jinjs   = require('jinjs');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jinjs');
  app.register('.html', require('jinjs'));
  app.register('view options', {
    'layout': false
  });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  mongoose.connect('mongodb://localhost/toes_are_wet');
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  mongoose.connect('mongodb://localhost/test_the_water');
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

// Buoys
app.get    ('/buoys', routes.listBuoys);
app.get    ('/buoys/:id', routes.getBuoy);
app.post   ('/buoys', routes.createBuoy);
app.delete ('/buoys/:id', routes.deleteBuoy);

// Waves
app.get  ('/waves', routes.listWaves);
app.get  ('/waves/:id', routes.getWave);
app.post ('/waves', routes.createWave);
app.delete ('/waves/:id', routes.deleteWave);

// Surf Sessions
app.get  ('/logs', routes.listLogs);
app.post ('/logs', routes.createSesh);
app.get  ('/logs/:id', routes.getLog);
app.delete ('/logs/:id', routes.deleteLog);

app.listen(3000);
console.log("Express server listening on port %d in %s mode",
            app.address().port, app.settings.env);
