var request = require('request');
var fs = require('fs');

module.exports = webhooks => (req, res) => {
  try {
    let bodies = fs.readFileSync('bodies.json');
  } catch (e) {
    let bodies = {};
  }
  bodies = JSON.parse(bodies);
  bodies.gitlab = bodies.gitlab || {};
  bodies.gitlab[req.body.object_kind] = bodies.gitlab[req.body.object_kind] || {};
  bodies.gitlab[req.body.object_kind][req.body.event_name] = JSON.stringify(req.body);
  fs.writeFileSync('bodies.json', bodies);
  let content = '.';
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
    content = `Repo \`${repoName}\`: ${repoHomepage}\n`
     //+ `updated by user \`${userEmail}\` ${userAvatar}\n`
     + `updated by user \`${commit.author && commit.author.email}\`\n`
     + `commit \`${commit.id}\`: \`${commit.message}\`\n`
     + `added: \`[${commit.added}]\`\n`
     + `modified: \`[${commit.modified}]\`\n`
     + `removed: \`[${commit.removed}]\`\n`
  }
  console.log('content =', content);
  return Promise.all(webhooks.map(webhook => new Promise((resolve, reject) => {
    console.log('GitLab webhook =', webhook)
    request({
      method: 'POST',
      url: webhook,
      json: {
        username: 'GitLab listener',
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
