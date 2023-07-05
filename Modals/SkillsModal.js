const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const skillSchema = new mongoose.Schema({
  skillName: {
    type: String,
    required: true,
    unique: true
  },
  skillDescription: {
    type: String,
    required: true
  },
  priceTerm: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  skillLevel: {
    type: String,
    required: true
  },
  skillVisibility: {
    type: String,
    required: true
  },
  skillTechnologies: {
    type: [String],
    required: true
  },
  uuid: {
    type: String,
    default: uuidv4,
    unique: true
  },
  receivedSkill: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const Skill = mongoose.model('Skill', skillSchema);

module.exports = Skill;
