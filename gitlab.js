var request = require('request');

module.exports = webhook => (req, res) => {
  if (req.body && req.body.object_kind == 'push') {
    let userEmail = req.body.user_email;
    console.log('userEmail =', userEmail);
    let userAvatar = req.body.user_avatar;
    console.log('userAvatar =', userAvatar);
    let repoName = req.body.repository && req.body.repository.name;
    console.log('repoName =', repoName);
    let repoHomepage = req.body.repository && req.body.repository.homepage;
    console.log('repoHomepage =', repoHomepage);
    let commits = req.body.commits;
    console.log('commits =', commits);
    let commit = (commits || [])[0] || {};
    let content = `Repo \`${repoName}\`: \`${repoHomepage}\`\n`
     + `updated by user \`${userEmail}\` ${userAvatar}\n`
     + `commit \`${commit.id}\`: \`${commit.message}\`\n`
     + `added: \`${commit.added}\`\n`
     + `modified: \`${commit.modified}\`\n`
     + `removed: \`${commit.removed}\`\n`
    console.log('content =', content);
    request({
     method: 'POST',
     url: webhook,
     json: {
       username: 'GitLab listener',
       content: content
     }}, (err, ret, body) => {
       console.log('err =', err);
       //console.log('ret =', ret);
       if (err) res.error(err);
       res.status(200).send(req.body);
     });
  } else {
    let reqBody = JSON.stringify(req.body);
    console.log('GitLab req.body =', reqBody);
    request({
     method: 'POST',
     url: webhook,
     json: {
       username: 'GitLab listener',
       content: 'something happen'
     }}, (err, ret, body) => {
       console.log('err =', err);
       //console.log('ret =', ret);
       if (err) res.error(err);
       res.status(200).send(req.body);
     });
  }
}
