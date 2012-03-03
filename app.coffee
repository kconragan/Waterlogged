express = require("express")
swig = require("swig")
routes = require("./routes")
app = module.exports = express.createServer()
mongoose = require("mongoose")

app.configure ->
  swig.init
    root: __dirname + "/views"
    allowErrors: true
  app.set "views", __dirname + "/views"
  app.register ".html", swig
  app.set "view engine", "swig"
  app.set "view options",
    layout: false
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use app.router
  app.use express.static(__dirname + "/public")

app.configure "development", ->
  mongoose.connect 'mongodb://localhost/waterlogged-dev'
  app.use express.errorHandler(
    dumpExceptions: true
    showStack: true
  )

app.configure "production", ->
  mongoose.connect 'mongodb://localhost/waterlogged'
  app.use express.errorHandler()
  
app.get "/", routes.index
app.get "/post/new", routes.newPost
app.post "/post/new", routes.addPost
app.get "/post/:id", routes.viewPost

app.listen 3000
console.log "Express server listening on port %d in %s mode", app.address().port, app.settings.env
