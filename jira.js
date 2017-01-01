var request = require('request');

module.exports = webhook => (req, res) => {
  //console.log('req.body =', req.body);
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
    let content = `Issue \`${issueKey}\`: \`${issueSummary}\`\n`
      + `updated by user \`${userEmail}\`\n`
      + `field \`${change.field}\` changed\n`
      + `\`${change.fromString}\` => \`${change.toString}\`\n`
    console.log('content =', content);
    request({
      method: 'POST',
      url: webhook,
      json: {
        username: 'JIRA listener',
        content: content
      }}, (err, ret, body) => {
        console.log('err =', err);
        //console.log('ret =', ret);
        if (err) res.error(err);
        res.status(200).send(req.body);
      });
  } else {
   request({
    method: 'POST',
    url: webhook,
    json: {
      username: 'JIRA listener',
      content: 'something happen'
    }}, (err, ret, body) => {
      console.log('err =', err);
      //console.log('ret =', ret);
      if (err) res.error(err);
      res.status(200).send(req.body);
    });
  }
}
