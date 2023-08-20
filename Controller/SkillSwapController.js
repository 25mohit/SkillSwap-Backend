const asyncHandler = require('express-async-handler');
const SkillSwapRequest = require('../Modals/SkillSwapModel');
const Notification = require('../Modals/NotificationModal');
const User = require('../Modals/UserModal');
const Skill = require('../Modals/SkillsModal');

const SendSkillSwapRequest = asyncHandler(async (req, res) => {
  const { userId, skillId, swapingID } = req.body;
  const senderUserId = req.user.id; // Assuming the authenticated user's ID is available in req.user.id

  if (!userId || !skillId || !swapingID) {
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
  const swapingSkill = await Skill.findById(swapingID);

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
    swapingID,
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
    senderSkillNameReqForSwaping: swapingSkill?.skillName,
    status: 'pending',
    message: 'You have received a SkillSwap request.',
    requestTime: skillSwapRequest.createdAt,
    skillDetails: skillSwapRequest.skillId,
  });
  await notification.save();

  res.status(201).json({ message: 'SkillSwap request sent successfully' });
});

const HandleSkillSwapRequest = asyncHandler ( async (req, res) => {
  const { id } = req.user; // Assuming the authenticated user's ID is available in req.user.id

  const { action , skill, notification } = req.body
  
  const getNoti = await Notification.findOne({_id:notification, status: "pending"})
  const getSkillSwapReq = await SkillSwapRequest.findOne({skillId:skill, status: "pending"})

  if (!getNoti || !getSkillSwapReq) {
    return res.status(400).send({status: false, message:"Action already taken for this Skill"});
  }

  if (action === 'approve') {
    getSkillSwapReq.status = 'accepted'
    getNoti.status = 'accepted';
    const getUser = await User.findById(id)
    getUser.swapedSkills = [...getUser.swapedSkills, skill]
  
    try {
  
      await getUser.save()
      await getNoti.save();
      await getSkillSwapReq.save();

      return res.status(200).json({ status: true, message: "Skill Swap Request Approved" });
    } catch (error) {
      return res.status(500).json({ status: false, message: "An error occurred" });
    }
  } else if(action === 'reject') {
    getSkillSwapReq.status = 'rejected'
    getNoti.status = 'rejected';

    try {
      const updatedNotification = await getNoti.save();
      const updateSkillReq = await getSkillSwapReq.save();

      return res.status(200).json({ status: true, message: "Skill Swap Request Rejected" });
    } catch (error) {
      return res.status(500).json({ status: false, message: "An error occurred" });
    }
  }
})

module.exports = { SendSkillSwapRequest, HandleSkillSwapRequest  };
