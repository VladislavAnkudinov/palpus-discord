var express = require('express');
var request = require('request');
var bodyparser = require('body-parser');
require('dotenv').config();

var app = express();
app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());

var webhooks = process.env.DISCORD_WEBHOOKS;
console.log('DISCORD_WEBHOOKS =', webhooks);
webhooks = webhooks.split(';');

var jiraHooks = process.env.JIRA_HOOKS;
console.log('JIRA_HOOKS =', jiraHooks);

var gitlabHooks = process.env.GITLAB_HOOKS;
console.log('GITLAB_HOOKS =', gitlabHooks);

let filterHooks = (hooks, inexes) => {
  return hooks.filter(idx => indexes.indexOf(idx) + 1);
}

jiraHooks = filterHooks(hooks, jiraHooks);
gitlabHooks = filterHooks(hooks, gitlabHooks);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/gitlab', require('./gitlab.js')(jiraHooks));
app.post('/jira', require('./jira.js')(gitlabHooks));

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
