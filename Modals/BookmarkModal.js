const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  skillName: {
    type: String,
    required: true,
  },
  skillDescription: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  skillTechnologies: {
    type: Array,
    required: true,
  },
  skillVisibility: {
    type: String,
    required: true,
  },
  skillLevel: {
    type: String,
    required: true,
  },
  priceTerm: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  // Add any other relevant fields for the bookmark
},{timestamps: true});

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

module.exports = Bookmark;
