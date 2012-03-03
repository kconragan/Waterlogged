/**
 * Module dependencies.
 */

var express = require('express')
  , swig = require('swig')
  , routes = require('./routes')
  , people

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  swig.init({
    root: __dirname + '/views',
    allowErrors: true // allows errors to be thrown and caught by express
  });
  app.set('views', __dirname + '/views');
  app.register('.html', swig);
  app.set('view engine', 'swig');
  app.set('view options', { layout: false });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
app.get('/', function (req, res) {
    res.render(routes.index);
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode",
            app.address().port, app.settings.env);
