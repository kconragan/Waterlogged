
/**
 * Module dependencies.
 */

var express      = require('express');
var mongoose     = require('mongoose');
var everyauth    = require('everyauth');
var mongooseAuth = require('mongoose-auth');
var Schema       = mongoose.Schema;
var routes       = require('./routes');
var jinjs        = require('jinjs');

var UserSchema = new Schema({});
var User;

everyauth.debug = true;

UserSchema.plugin(mongooseAuth, {
  // Here, we attach your User model to every module
  everymodule: {
    everyauth: {
        User: function () {
          return User;
        }
    }
  },
  twitter: {
    everyauth: {
      myHostname: 'http://localhost:3000',
      consumerKey: 'OEIqNpgJPvvZx5okOaoipA',
      consumerSecret: 'VlKyUFw4U2LhRxNg14qYhMdFgsYO98b3ziZCt9qY4',
      findOrCreateUser: function (session, accessToken, accessTokenSecret, twitterUser) {
        var promise = this.Promise();
        var User = this.User()();
        console.log(User);
        var  self = this;
        User.findOne({'twit.id': twitterUser.id}, function (err, foundUser) {
          if (err) return promise.fail(err);
          if (foundUser) {
            return promise.fulfill(foundUser);
          }
          User.createWithTwitter(twitterUser, accessToken, accessTokenSecret, function (err, createdUser) {
            if (err) return promise.fail(err);
            return promise.fulfill(createdUser);
          });
        });
        console.log(twitterUser);
        return promise;
      },
      redirectPath: '/'
    }
  }
});

var User = mongoose.model('User', UserSchema);

var app = module.exports = express.createServer(
  express.cookieParser(),
  express.session({ secret: 'foobar'}),
  mongooseAuth.middleware()
);

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
  // app.use(app.router);
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

mongooseAuth.helpExpress(app);

// Routes

app.get('/', routes.index);

// Buoys
app.get    ('/buoys', routes.listBuoys);
app.get    ('/buoys/:id', routes.getBuoy);
app.get    ('/buoys/:id/:year/:month/:day/:time', routes.getBuoyReading);
app.post   ('/buoys', routes.createBuoy);
app.delete ('/buoys/:id', routes.deleteBuoy);

// Waves
app.get  ('/waves', routes.listWaves);
app.get  ('/waves/:id', routes.getWave);
app.post ('/waves', routes.createWave);
app.delete ('/waves/:id', routes.deleteWave);

// Surf Sessions
app.get    ('/logs', routes.listLogs);
app.post   ('/logs', routes.createSesh);
app.get    ('/logs/:id', routes.getLog);
app.post   ('/logs/:id/update', routes.updateSeshData);
app.delete ('/logs/:id', routes.deleteLog);

app.listen(3000);
console.log("Express server listening on port %d in %s mode",
            app.address().port, app.settings.env);