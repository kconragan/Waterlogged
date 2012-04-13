
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
  mongoose.connect('mongodb://localhost/test_the_water');
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  mongoose.connect('mongodb://localhost/test_the_water');
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);

// Buoys
app.get  ('/buoy', routes.listBuoys);
app.post ('/buoy', routes.createBuoy);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
