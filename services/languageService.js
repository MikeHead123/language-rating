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
    const languages = await this.languageModel.find({}, {
      _id: 1, name: 1, percentInRating: 1, changesPercentFromLastMonth: 1, positionChanges: 1,
    },
    {
      sort: {
        percentInRating: -1,
      },
    }).lean();
    let position = 1;
    const newLanguages = languages.map((currentLang) => {
      currentLang.position = position;
      position++;
      return currentLang;
    });
    return newLanguages;
  }

  async saveLanguage(data) {
    if (!data.name || typeof data.name !== 'string') {
      throw new Error('name must be a string');
    }
    const language = await this.languageModel.create({
      name: data.name,
    });
    return language;
  }

  async delLanguage(data) {
    if (!data.id) {
      throw new Error('doesnot have id');
    }
    await this.languageModel.findByIdAndRemove(data.id);
    await this.delLanguageVotes(data.id);
    await this.updateRatings();
    return data.id;
  }

  // eslint-disable-next-line consistent-return
  async delLanguageVotes(languageId) {
    if (!languageId) {
      throw new Error('doesnot have languageId');
    }
    await this.ratingModel.find({ languageId }).remove();
  }

  async updateLanguage(data) {
    if (!data.name || typeof data.name !== 'string' || !data.id) {
      throw new Error('name must be a string');
    }
    await this.languageModel.findOneAndUpdate(
      { _id: data.id },
      {
        $set: {
          name: data.name,
        },
      },
    );
    return data.id;
  }

  async getTopLanguages() {
    const languages = await this.languageModel.find({}, {
      _id: 0, name: 1, percentInRating: 1,
    },
    {
      skip: 0,
      limit: 5,
      sort: {
        percentInRating: -1,
      },
    }).lean();
    let position = 1;
    const newLanguages = languages.map((currentLang) => {
      currentLang.position = position;
      position++;
      return currentLang;
    });
    return newLanguages;
  }

  async saveVote(data) {
    if (!data.languageId) {
      throw new Error('doesnot have languageId');
    }
    const exists = await this.getLanguage(data.languageId);
    if (exists === null) {
      throw new Error('language doesnot exists');
    }
    const rating = await this.ratingModel.create({
      languageId: data.languageId,
    });
    await this.updateRatings();
    await rating.update(
      {
        createdAt: new Date(),
      });
    return rating;
  }

  async getVotesByCurrentMonth() {
    const ratings = await this.ratingModel.aggregate([
      { $project: { languageId: 1, month: { $month: '$createdAt' } } },
      { $match: { month: (new Date()).getMonth() + 1 } },
    ]);
    return ratings;
  }

  async getVotes() {
    const ratings = await this.ratingModel.find({});
    return ratings;
  }

  async updateRatings() {
    const languages = await this.getLanguages();
    const ratingsByCurrentMonth = await this.getVotesByCurrentMonth();
    const ratings = await this.getVotes();
    const newLanguages = languages.map((currentLang) => {
      // eslint-disable-next-line no-underscore-dangle
      if (ratingsByCurrentMonth.length === 0 && ratings.length > 0) { // обнуляем изменение в следующем месяце
        currentLang.changesPercentFromLastMonth = 0;
        currentLang.positionChanges = false;
      }
      const totalVoices = ratings.reduce((total, currentRaiting) => (currentLang._id.toString() === currentRaiting.languageId.toString() ? total + 1 : total), 0);

      currentLang.changesPercentFromLastMonth = (totalVoices / ratings.length * 100 - currentLang.percentInRating)
        + currentLang.changesPercentFromLastMonth;

      currentLang.percentInRating = totalVoices / ratings.length * 100;

      if (currentLang.changesPercentFromLastMonth !== 0) {
        currentLang.positionChanges = true;
      } else {
        currentLang.positionChanges = false;
      }
      return currentLang;
    });
    newLanguages.sort((a, b) => b.percentInRating - a.percentInRating);

    newLanguages.forEach(async (currentLang) => {
      const updateObject = {
        changesPercentFromLastMonth: currentLang.changesPercentFromLastMonth,
        percentInRating: currentLang.percentInRating,
        positionChanges: currentLang.positionChanges,
      };
      await this.languageModel.findOneAndUpdate(
        { _id: currentLang._id },
        {
          $set: updateObject,
        },
      );
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
