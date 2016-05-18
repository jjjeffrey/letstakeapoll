exports.vote = function(req, res, next) {
  if (req.params.id != null
  &&  req.params.id.length <= 16
  &&  Number.isSafeInteger(parseInt(req.params.id))
  &&  req.body.choice != null
  &&  req.body.choice.length <= 2
  &&  Number.isSafeInteger(parseInt(req.body.choice))) {
    return next();
  }
  return res.redirect('/');
};

exports.create = function(req, res, next) {
  if (req.body.title != null
  &&  req.body.title.length <= 100
  &&  req.body.choices != null
  &&  req.body.choices.length <= 1000) {
    var choices = req.body.choices.split('\r\n');
    if (choices.length <= 10) {
      for (var i = 0; i < choices.length; i++) {
        if (choices[i].length > 100) {
          return res.redirect('/');
        }
      }
      return next();
    }
  }
  return res.redirect('/');
};
