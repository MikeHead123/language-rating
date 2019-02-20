const mongoose = require('mongoose');

const LanguageSchema = new mongoose.Schema({
  name: String,
  position: Number,
  percentInRating: { type: Number, default: 0 },
  changesPercentFromLastMounce: { type: Number, default: 0 },
  positionChanges: { type: Boolean, default: false },
});
mongoose.model('Language', LanguageSchema);

module.exports = mongoose.model('Language');
