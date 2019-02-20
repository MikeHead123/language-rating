// const http = require('http');
const url = require('url');

// eslint-disable-next-line global-require
const languageService = new (require('./../services/languageService'))();

// eslint-disable-next-line arrow-body-style
const getDataFromJson = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const postBody = JSON.parse(body);
        return resolve(postBody);
      } catch (err) {
        return reject(err);
      }
    });
  });
};

module.exports = async (req, res) => {
  const reqUrl = url.parse(req.url, true);

  if (reqUrl.pathname === '/language' && req.method === 'GET') {
    const response = await languageService.getLanguages();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(response));
  }
  if (reqUrl.pathname === '/language' && req.method === 'POST') {
    try {
      const postBody = await getDataFromJson(req);
      const response = await languageService.saveLanguage(postBody);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(response));
    } catch (err) {
      console.log(err)
      res.statusCode = 500;
      return res.end('error');
    }
  }
  if (reqUrl.pathname === '/language' && req.method === 'DELETE') {
    try {
      const postBody = await getDataFromJson(req);
      const response = await languageService.delLanguage(postBody);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(response));
    } catch (err) {
      console.log(err)
      res.statusCode = 500;
      return res.end('error');
    }
  }
  if (reqUrl.pathname === '/language' && req.method === 'PUT') {
    try {
      const postBody = await getDataFromJson(req);
      const response = await languageService.updateLanguage(postBody);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(response));
    } catch (err) {
      console.log(err)
      res.statusCode = 500;
      return res.end('error');
    }
  }
  if (reqUrl.pathname === '/language/top5' && req.method === 'GET') {
    const response = await languageService.getTopLanguages();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(response));
  }
  if (reqUrl.pathname === '/languageVote' && req.method === 'POST') {
    try {
      const postBody = await getDataFromJson(req);
      const response = await languageService.saveVote(postBody);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(response));
    } catch (err) {
      console.log(err)
      res.statusCode = 500;
      return res.end('error');
    }
  }
  res.statusCode = 500;
  res.setHeader('Content-Type', 'text/plain');
  return res.end(`Invalid Endpoint: ${reqUrl.pathname}`);
};
