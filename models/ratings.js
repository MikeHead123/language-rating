const mongoose = require('mongoose');

const LanguageRatings = new mongoose.Schema({
  languageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Language' },
  createdAt: { type: Date, default: Date.now },
});
mongoose.model('LanguageRatings', LanguageRatings);

module.exports = mongoose.model('LanguageRatings');
