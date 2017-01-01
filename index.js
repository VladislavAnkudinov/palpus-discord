var express = require('express');
var request = require('request');
var bodyparser = require('body-parser');
require('dotenv').config();

var app = express();
app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());

var webhook = process.env.DISCORD_WEBHOOK;
console.log('DISCORD_WEBHOOK =', webhook);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/jira', (req, res) => {
 //console.log('req.body =', req.body);
 request({
  method: 'POST',
  url: webhook,
  json: {
    username: 'Jira listener',
    content: 'something happen'
  }}, (err, ret, body) => {
    console.log('err =', err);
    //console.log('ret =', ret);
    if (err) res.error(err);
    res.status(200).send(req.body);
  });
});

app.post('/webhook', (req, res) => {
  console.log('req =', req.body);
  request({
    method: 'POST',
    url: webhook,
    json: {
      content: req.body.msg,
      username: 'palpus-discord'
    }
  });
  res.redirect('/');
});

app.listen(3000, () => {
  console.log('Server started!');
});
