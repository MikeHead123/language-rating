
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
const prepareResponce = (res, responce) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(responce));
};

module.exports = async (req, res) => {
  const reqUrl = url.parse(req.url, true);

  if (reqUrl.pathname === '/language' && req.method === 'GET') {
    const responce = await languageService.getLanguages();
    return prepareResponce(res, responce);
  }
  if (reqUrl.pathname === '/language' && req.method === 'POST') {

    const postBody = await getDataFromJson(req);
    const responce = await languageService.saveLanguage(postBody);

    return prepareResponce(res, responce);
  }
  if (reqUrl.pathname === '/language' && req.method === 'DELETE') {

    const postBody = await getDataFromJson(req);
    const responce = await languageService.delLanguage(postBody);

    return prepareResponce(res, responce);
  }
  if (reqUrl.pathname === '/language' && req.method === 'PUT') {
    const postBody = await getDataFromJson(req);
    const responce = await languageService.updateLanguage(postBody);

    return prepareResponce(res, responce);
  }
  if (reqUrl.pathname === '/language/top5' && req.method === 'GET') {
    const responce = await languageService.getTopLanguages();
    return prepareResponce(res, responce);
  }
  if (reqUrl.pathname === '/languageVote' && req.method === 'POST') {
    const postBody = await getDataFromJson(req);
    const responce = await languageService.saveVote(postBody);
    return prepareResponce(res, responce);
  }
  res.statusCode = 500;
  res.setHeader('Content-Type', 'text/plain');
  return res.end(`Invalid Endpoint: ${reqUrl.pathname}`);
};
