const asyncHandler = require('express-async-handler');
const SkillSwapRequest = require('../Modals/SkillSwapModel');
const Notification = require('../Modals/NotificationModal');
const User = require('../Modals/UserModal');
const Skill = require('../Modals/SkillsModal');

const SendSkillSwapRequest = asyncHandler(async (req, res) => {
  const { userId, skillId } = req.body;
  const senderUserId = req.user.id; // Assuming the authenticated user's ID is available in req.user.id

  if (!userId || !skillId) {
    res.status(400).json({ message: 'User ID and skill ID are required' });
    return;
  }

  const receiverUser = await User.findById(userId);
  if (!receiverUser) {
    res.status(404).json({ message: 'Receiver user not found' });
    return;
  }

  // Check if the skill exists
  const skill = await Skill.findById(skillId);
  if (!skill) {
    res.status(404).json({ message: 'Skill not found' });
    return;
  }

  // Check if a SkillSwapRequest already exists with the same sender, receiver, and skill
  const existingRequest = await SkillSwapRequest.findOne({
    senderUserId,
    receiverUserId: userId,
    skillId,
  });
  if (existingRequest) {
    res.status(400).json({ message: 'SkillSwap request already sent' });
    return;
  }

  // Create a new SkillSwapRequest
  const skillSwapRequest = new SkillSwapRequest({
    senderUserId,
    receiverUserId: userId,
    skillId,
    status: 'pending', // Set the initial status as pending
  });

  // Save the SkillSwapRequest to the database
  await skillSwapRequest.save();

  // Increase the receivedSkill count of the skill
  skill.receivedSkill += 1;
  await skill.save();

  // Send a notification to the receiver
  const notification = new Notification({
    userId,
    senderUserId,
    status: 'pending',
    message: 'You have received a SkillSwap request.',
    requestTime: skillSwapRequest.createdAt,
    skillDetails: skillSwapRequest.skillId,
  });
  await notification.save();

  res.status(201).json({ message: 'SkillSwap request sent successfully' });
});

module.exports = { SendSkillSwapRequest };
