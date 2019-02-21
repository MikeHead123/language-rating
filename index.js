const http = require('http');
const mongoose = require('mongoose');
const requestHandler = require('./handlers/requestHandler');
require('./dbConnection')();

const port = 3000;
const proxy = async (req, res) => {
  try {
    await requestHandler(req, res);
  } catch (err) {
    console.log(err);
    res.statusCode = 500;
    return res.end('error');
  }
};
const server = http.createServer(proxy);
server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }
  console.log(`server is listening on ${port}`);
});

const closeAllConnections = () => {
  console.log('Closing http server.');
  server.close(() => {
    console.log('Http server closed.');
    mongoose.connection.close(false, () => {
      console.log('MongoDb connection closed.');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', () => {
  console.info('SIGTERM signal received.');
  closeAllConnections();
});

process.on('SIGINT', () => {
  console.info('SIGINT signal received.');
  closeAllConnections();
});
