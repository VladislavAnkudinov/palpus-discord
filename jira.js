var request = require('request');
var fs = require('fs');

module.exports = webhooks => (req, res) => {
  let bodies;
  try {
    bodies = String(fs.readFileSync('bodies.json'));
    bodies = JSON.parse(bodies);
  } catch (e) {
    bodies = {};
  }
  bodies.jira = bodies.jira || {};
  bodies.jira[req.body.webhookEvent] = bodies.jira[req.body.webhookEvent] || {};
  bodies.jira[req.body.webhookEvent][req.body.issue_event_type_name] = req.body;
  fs.writeFileSync('bodies.json', JSON.stringify(bodies, null, '  '));
  let content = '';
  if (req.body && req.body.webhookEvent == 'jira:issue_updated') {
    let userEmail = req.body.user && req.body.user.emailAddress;
    console.log('userEmail =', userEmail);
    let issueKey = req.body.issue && req.body.issue.key;
    console.log('issueKey =', issueKey);
    let issueSummary = req.body.issue && req.body.issue.fields && req.body.issue.fields.summary;
    console.log('issueSummary =', issueSummary);
    let changes = req.body.changelog && req.body.changelog.items;
    console.log('changes =', changes);
    let change = (changes || [])[0] || {};
    content = `Issue \`${issueKey}\`: \`${issueSummary}\`\n`
      + `updated by user \`${userEmail}\`\n`
      + `field \`${change.field}\` changed\n`
      + `\`${change.fromString}\` => \`${change.toString}\`\n`
  }
  console.log('content =', content);
  if (!content) return res.status(200).send(req.body);
  return Promise.all(webhooks.map(webhook => new Promise((resolve, reject) => {
    console.log('JIRA webhook =', webhook)
    request({
      method: 'POST',
      url: webhook,
      json: {
        username: 'JIRA listener',
        content: content
      }
    }, (err, ret, body) => {
      console.log('err =', err);
      if (err) return reject(error);
      resolve(req.body);
    });
  })))
  .then(() => {
    res.status(200).send(req.body);
  })
  .catch(() => {
    res.error(err);
  })
}
