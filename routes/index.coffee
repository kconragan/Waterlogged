Post = require '../models/Post'
Surf = require '../models/Surf'

module.exports = 
  index: (req, res) ->
    Post.find {}, (err, posts) ->
      res.render "index.html",
        title: "Waterlogged"
        posts: posts

  newPost: (req, res) ->
    res.render 'log_session.html', title:"Log a new surf session"

  addPost: (req, res) ->
    new Post(req.body.post).save ->
      res.redirect "/"

  viewPost: (req, res) ->
    Post.findById req.params.id, (err, post) ->
      res.render 'post', post: post, title: post.title
