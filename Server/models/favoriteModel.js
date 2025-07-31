const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipeId: {
    type: Number,
    required: true
  },
  title: String,
  image: String,
  sourceUrl: String,
  ingredients: [String],
  savedAt: {
    type: Date,
    default: Date.now
  }
});

const Favorite = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorite;
