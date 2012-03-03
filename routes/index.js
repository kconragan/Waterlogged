/*
 * GET home page.
 */

exports.index = function(req){
  res.render('index', { title: 'Express' })
};
