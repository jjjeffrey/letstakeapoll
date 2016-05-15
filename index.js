var express = require('express');
var bodyParser = require('body-parser');

var valid = require('./valid.js');
var db = require('./db.js');

var app = express();

app.use(express.static('static'));

app.use(bodyParser.urlencoded({
  extended: true
}));

app.set('view engine', 'pug');

app.get('/:id([0-9]+)', db.getPoll, function(req, res) {
  res.render('vote', { 'id': req.params.id, 'title': req.title, 'choices': req.choices });
});

app.get('/:id([0-9]+)/results', db.getPoll, function(req, res) {
  res.render('results', { 'id': req.params.id, 'title': req.title, 'choices': req.choices });
});

app.post('/:id([0-9]+)/vote', valid.vote, db.vote, function(req, res) {
  res.redirect('/' + req.params.id + '/results');
});

app.post('/create', valid.create, db.create, function(req, res) {
  res.redirect('/' + req.id);
});

app.use(function(req, res, next) {
  res.status(404).send('404 not found');
});

app.listen(3000);
