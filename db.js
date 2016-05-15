var redis = require('redis');

var client = redis.createClient();

//
// The DB uses Redis.
// It stores and increments a number called nextid to retrieve the next ID for when a new poll is made.
// It stores polls as hashes, with key/value pairs for the title, choice names, and votes for each choice.
// It stores whether or not a person has voted for a poll before by adding their IP address to a HyperLogLog.
//
// getPoll
// HGETALL poll:#
//
// create
// INCR nextid
// HMSET poll:# title "TITLE" choice:# "CHOICE #" votes:# "0" ...
//
// vote
// HEXISTS poll:# votes:#
// PFADD voters:# "IP"
// HINCRBY poll:# votes:# 1
//

exports.getPoll = function(req, res, next) {
  client.hgetall('poll:' + req.params.id, function(err, reply) {
    if (err) {
      return res.status(500).send('500 internal server error');
    }
    if (reply == null) {
      return res.status(404).send('404 not found');
    }
    req.choices = [];
    req.title = '';
    var keys = Object.keys(reply);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i] === 'title') {
        req.title = reply[keys[i]];
      } else {
        var parts = keys[i].split(':');
        var type = parts[0];
        var index = parts[1];
        if (req.choices[index] == null) {
          req.choices[index] = {};
        }
        req.choices[index][type] = reply[keys[i]];
      }
    }
    return next();
  });
};

exports.vote = function(req, res, next) {
  client.hexists('poll:' + req.params.id, 'votes:' + req.body.choice, function(err, reply) {
    if (err) {
      return res.status(500).send('500 internal server error');
    }
    if (reply === 0) {
      return res.redirect('/');
    }
    client.pfadd('voters:' + req.params.id, req.ip, function(err, reply) {
      if (err) {
        return res.status(500).send('500 internal server error');
      }
      if (reply === 0) {
        return res.redirect('/' + req.params.id + '/results');
      }
      client.hincrby('poll:' + req.params.id, 'votes:' + req.body.choice, '1', function(err, reply) {
        if (err) {
          return res.status(500).send('500 internal server error');
        }
        return next();
      });
    });
  });
};

exports.create = function(req, res, next) {
  client.incr('nextid', function(err, reply) {
    if (err) {
      return res.status(500).send('500 internal server error');
    }
    req.id = reply;
    var args = ['poll:' + reply, 'title', req.body.title];
    var choices = req.body.choices.split('\n');
    for (var i = 0; i < choices.length; i++) {
      args.push('choice:' + i, choices[i], 'votes:' + i, '0');
    }
    client.hmset(args, function(err, reply) {
      if (err) {
        return res.status(500).send('500 internal server error');
      }
      return next();
    });
  });
};
