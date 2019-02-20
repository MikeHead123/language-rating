const mongoose = require('mongoose');

const LanguageSchema = new mongoose.Schema({
  name: String,
  position: Number,
  percentInRating: Number,
  changesPercentFromLastMounce: Number,
  positionChanges: Number,
});
mongoose.model('Language', LanguageSchema);

module.exports = mongoose.model('Language');
