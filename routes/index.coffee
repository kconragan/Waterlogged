posts = []

module.exports = 
  index: (req, res) ->
    res.render "index.html",
      title: "Waterlogged"
      posts: posts 

  newPost: (req, res) ->
    res.render "log_session.html", title:"Write New Post"

  addPost: (req, res) ->
    post = req.body.post
    post.id = posts.length
    posts.push post
    res.redirect "/"

  viewPost: (req, res) ->
    post = posts[req.params.id]
    res.render 'post', post: post, title: post.title

