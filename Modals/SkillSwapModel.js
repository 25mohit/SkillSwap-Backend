const mongoose = require('mongoose');

const skillSwapRequestSchema = new mongoose.Schema({
  senderUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  skillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {timestamps: true});

const SkillSwapRequest = mongoose.model('SkillSwapRequest', skillSwapRequestSchema);

module.exports = SkillSwapRequest;
