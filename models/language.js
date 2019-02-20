const mongoose = require('mongoose');

const LanguageSchema = new mongoose.Schema({
  name: String,
  percentInRating: { type: Number, default: 0 },
  changesPercentFromLastMonth: { type: Number, default: 0 },
  positionChanges: { type: Boolean, default: false },
});
mongoose.model('Language', LanguageSchema);

module.exports = mongoose.model('Language');
