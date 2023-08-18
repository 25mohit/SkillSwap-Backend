const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  senderSkillNameReqForSwaping: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  senderUserId: {
    type: String,
    required: true,
  },
  requestTime: {
    type: Date,
    required: true,
  },
  skillDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
},{timestamps: true});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
