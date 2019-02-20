const http = require('http');
const mongoose = require('mongoose');
const languageController = require('./controllers/languageController');
require('./dbConnection')();

const port = 3000;

const server = http.createServer(languageController);
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
