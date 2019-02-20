const http = require('http');
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
