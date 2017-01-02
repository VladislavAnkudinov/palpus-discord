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
  bodies.gitlab = bodies.gitlab || {};
  bodies.gitlab[req.body.object_kind] = bodies.gitlab[req.body.object_kind] || {};
  bodies.gitlab[req.body.object_kind][req.body.event_name] = req.body;
  fs.writeFileSync('bodies.json', JSON.stringify(bodies, null, '  '));
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
    content = `PUSH: repo \`${repoName}\`: ${repoHomepage}\n`
      //+ `updated by user \`${userEmail}\` ${userAvatar}\n`
      + `updated by user \`${commit.author && commit.author.email}\`\n`
      + `commit \`${commit.id}\`: \`${commit.message}\`\n`
      + `added: \`[${commit.added}]\`\n`
      + `modified: \`[${commit.modified}]\`\n`
      + `removed: \`[${commit.removed}]\`\n`;
  } else if (req.body && req.body.object_kind == 'pipeline') {
    let userName = req.body.user && req.body.user.username;
    console.log('userName =', userName);
    let avatarUrl = req.body.user && req.body.user.avatar_url;
    console.log('avatarUrl =', avatarUrl);
    let projectName = req.body.project && req.body.project.name;
    console.log('projectName =', projectName);
    let projectWebUrl = req.body.project && req.body.project.web_url;
    console.log('projectWebUrl =', projectWebUrl);
    let commit = req.body.commit || {};
    let build = (req.body.builds || [])[0] || {};
    let buildDescription = build.runner && build.runner.description;
    content = `PIPELINE: repo \`${projectName}\`: ${projectWebUrl}\n`
      //+ `updated by user \`${userEmail}\` ${userAvatar}\n`
      + `run pipeline by user \`${userName}\`\n`
      + `for commit \`${commit.id}\`: \`${commit.message}\`\n`
      + `by user \`${commit.author && commit.author.email}\`\n`
      + `build description: \`${buildDescription} \``
      + `build name: \`[${build.name}]\`\n`
      + `build stage: \`[${build.stage}]\`\n`
      + `build status: \`[${build.status}]\`\n`;
  } else if (req.body && req.body.object_kind == 'build') {
    let userEmail = req.body.user && req.body.user.email;
    console.log('userEmail =', userEmail);
    let repoName = req.body.repository && req.body.repository.name;
    console.log('repoName =', repoName);
    let repoHomepage = req.body.repository && req.body.repository.homepage;
    console.log('repoHomepage =', repoHomepage);
    let commit = req.body.commit || {};
    content = `BUILD: repo \`${repoName}\`: ${repoHomepage}\n`
      //+ `updated by user \`${userEmail}\` ${userAvatar}\n`
      + `run build by user \`${userEmail}\`\n`
      + `for commit \`${commit.id}\`: \`${commit.message}\`\n`
      + `by user \`${commit.author_name && commit.author_email}\`\n`
      + `build name: \`[${req.body.build_name}]\`\n`
      + `build stage: \`[${req.body.build_stage}]\`\n`
      + `build status: \`[${req.body.build_status}]\`\n`;
  }
  console.log('content =', content);
  return Promise.all(webhooks.map(webhook => new Promise((resolve, reject) => {
    console.log('GitLab webhook =', webhook);
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
};
