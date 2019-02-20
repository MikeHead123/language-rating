const mongoose = require('mongoose');

module.exports = () => {
  mongoose.connect(`mongodb://${process.env.DB_HOST || 'localhost'}:27017/languageStore`);
};
