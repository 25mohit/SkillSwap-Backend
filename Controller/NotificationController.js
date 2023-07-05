const asyncHandler = require('express-async-handler');
const Notification = require('../Modals/NotificationModal');
const User = require('../Modals/UserModal');
const Skill = require('../Modals/SkillsModal');

// Route: GET /api/notifications
// Description: Get all notifications for the logged-in user
const GetNotifications = asyncHandler(async (req, res) => {
  const id = req.user.id; // Assuming the authenticated user's ID is available in req.user.id

  // Find all notifications for the logged-in user
  const notifications = await Notification.find({ userId:id }).sort({ createdAt: 'desc' });

  // Fetch sender's name and email for each notification
  const populatedNotifications = await Promise.all(
    notifications.map(async (notification) => {
      const senderUser = await User.findById(notification.senderUserId);
      const skill = await Skill.findById(notification.skillDetails);

      const skillData = {
        skillName: skill.skillName,
        skillDescription: skill.skillDescription,
        skillLevel: skill.skillLevel,
        createdAt: skill.createdAt,
      }

      return {
        // _id: notification._id,
        // userId: notification.userId,
        // senderUserId: notification.senderUserId,
        senderName: senderUser ? senderUser.name : null,
        senderEmail: senderUser ? senderUser.email : null,
        profile: senderUser ? senderUser.profile : null,
        message: notification.message,
        requestTime: notification.requestTime,
        status: notification.status,
        skillDetails: skill ? skillData : null,
      };
    })
  );

  res.status(200).json(populatedNotifications);
});

module.exports = { GetNotifications };
