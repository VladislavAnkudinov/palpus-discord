module.exports = webhooks => (req, res) => {
  return Promise.all(webhooks.map(webhook => new Promise((resolve, reject) => {
    console.log('Zayaz webhook =', webhook)
    request({
      method: 'POST',
      url: webhook,
      json: {
        username: 'Zayaz',
        content: req.body.msg
      }
    }, (err, ret, body) => {
      console.log('err =', err);
      if (err) return reject(error);
      resolve(req.body);
    });
  })))
  .then(() => {
    res.status(200).send(req.body);
    //res.redirect('/');
  })
  .catch(() => {
    res.error(err);
  })
}
