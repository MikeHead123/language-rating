const languageModel = require('./../models/language');
const languageRatings = require('./../models/ratings');

let instance;

class LanguageService {
  constructor() {
    this.languageModel = languageModel;
    this.ratingModel = languageRatings;
    if (instance) { return instance; }
    instance = this;
  }

  async getLanguages() {
    try {
      const languages = await this.languageModel.find({});
      return languages;
    } catch (err) {
      return err;
    }
  }

  async saveLanguage(data) {
    if (!data.name || typeof data.name !== 'string') {
      throw new Error('name must be a string');
    }
    try {
      const languages = await this.getLanguages();
      const language = await this.languageModel.create({
        name: data.name,
        position: languages.length + 1,
        percentInRating: 0,
        changesPercentFromLastMounce: 0,
        positionChanges: 0,
      });
      return language;
    } catch (err) {
      return err;
    }
  }

  async delLanguage(data) {
    if (!data.id) {
      throw new Error('doesnot have id');
    }
    try {
      await this.languageModel.findByIdAndRemove(data.id);
      await this.delLanguageVotes(data.id);
      await this.updateRatings();
      return data.id;
    } catch (err) {
      return err;
    }
  }

  async delLanguageVotes(languageId) {
    if (!languageId) {
      throw new Error('doesnot have languageId');
    }
    try {
      await this.ratingModel.find({ languageId }).remove();
      return 1;
    } catch (err) {
      return err;
    }
  }

  async updateLanguage(data) {
    if (!data.name || typeof data.name !== 'string') {
      throw new Error('name must be a string');
    }
    try {
      await this.languageModel.findOneAndUpdate(
        { _id: data.id },
        {
          $set: {
            name: data.name,
          },
        },
      );
      return data.id;
    } catch (err) {
      return err;
    }
  }

  async getTopLanguages() {
    try {
      const languages = await this.languageModel.find({}, {
        _id: 0, name: 1, position: 1, percentInRating: 1,
      },
      {
        skip: 0,
        limit: 5,
        sort: {
          position: 1,
        },
      });
      return languages;
    } catch (err) {
      return err;
    }
  }

  async saveVote(data) {
    if (!data.languageId) {
      throw new Error('doesnot have languageId');
    }
    const exists = await this.getLanguage(data.languageId);
    if (exists === null) {
      console.log('nenf ff e e g');
      throw new Error('language doesnot exists');
    }
    try {
      const rating = await this.ratingModel.create({
        languageId: data.languageId,
      });
      await this.updateRatings();
      return rating;
    } catch (err) {
      return err;
    }
  }

  async getVotes() {
    try {
      const ratings = await this.ratingModel.aggregate([
        { $project: { languageId: 1, month: { $month: '$createdAt' } } },
        { $match: { month: (new Date()).getMonth() + 1 } },
      ]);
      return ratings;
    } catch (err) {
      return err;
    }
  }

  async updateRatings() {
    let languages = await this.getLanguages();
    const ratings = await this.getVotes();
    languages = languages.map((currentLang) => {
      // eslint-disable-next-line no-underscore-dangle
      const totalVoices = ratings.reduce((total, currentRaiting) => (currentLang._id.toString() === currentRaiting.languageId.toString() ? total + 1 : total), 0);
      // eslint-disable-next-line no-param-reassign
      currentLang.changesPercentFromLastMounce = totalVoices / ratings.length * 100 - +currentLang.percentInRating;
      // eslint-disable-next-line no-param-reassign
      currentLang.percentInRating = totalVoices / ratings.length * 100;
      return currentLang;
    });
    languages.sort((a, b) => {
      if (a.percentInRating < b.percentInRating) {
        return 1;
      }
      if (a.percentInRating > b.percentInRating) {
        return -1;
      }
      return 0;
    });

    languages.forEach(async (currentLang, index) => {
      try {
        await this.languageModel.findOneAndUpdate(
          { _id: currentLang.id },
          {
            $set: {
              changesPercentFromLastMounce: currentLang.changesPercentFromLastMounce,
              percentInRating: currentLang.percentInRating,
              position: index + 1,
              positionChanges: currentLang.position - (index + 1),
            },
          },
        );
      } catch (err) {
        return err;
      }
    });
  }

  async getLanguage(id) {
    if (!id) {
      throw new Error('doesnot have id');
    }
    const language = await this.languageModel.findById(id);
    return language;
  }
}

module.exports = LanguageService;
