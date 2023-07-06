const asyncHandler = require('express-async-handler');
const Skill = require('../Modals/SkillsModal');
const User = require('../Modals/UserModal');

const createSkill = asyncHandler(async (req, res) => {
  const { skillName, skillDescription, priceTerm, skillLevel, skillVisibility, skillTechnologies } = req.body;
  const { id } = req.user; // User UUID from the authenticated user

  if (!skillName || !skillDescription || !priceTerm || !skillLevel || !skillVisibility  || !skillTechnologies) {
    return res.status(400).json({ status: false, message: 'Invalid skill data.' });
  }

  const existingSkill = await Skill.findOne({ skillName, createdBy: id });

  if (existingSkill) {
    return res.status(400).json({ status: false, message: 'Skill with the same name already exists.' });
  }

  const newSkill = await Skill.create({
    skillName,
    skillDescription,
    priceTerm,
    skillLevel,
    skillVisibility,
    skillTechnologies:skillTechnologies?.split(','),
    createdBy: id // Assign the logged-in user's UUID as the createdBy value
  });

  if (newSkill) {
    return res.status(201).json({ status: true, message: 'Skill created successfully.' });
  } else {
    return res.status(500).json({ status: false, message: 'Failed to create skill.' });
  }
});

const updateSkill = asyncHandler(async (req, res) => {
  const { skillId } = req.params;
  const { skillName, skillDescription, priceTerm, skillLevel, skillVisibility, skillTechnologies } = req.body;

  if (!skillId || !skillName || !skillDescription || !priceTerm || !skillLevel || !skillVisibility || !skillTechnologies ) {
    return res.status(400).json({ status: false, message: 'Invalid skill data.' });
  }

  const skill = await Skill.findById(skillId);

  if (!skill) {
    return res.status(404).json({ status: false, message: 'Skill not found.' });
  }

  skill.skillName = skillName;
  skill.skillDescription = skillDescription;
  skill.priceTerm = priceTerm;
  skill.skillLevel = skillLevel;
  skill.skillVisibility = skillVisibility;
  skill.skillTechnologies = skillTechnologies?.split(',');

  const updatedSkill = await skill.save();

  if (updatedSkill) {
    return res.status(200).json({ status: true, message: 'Skill updated successfully.' });
  } else {
    return res.status(500).json({ status: false, message: 'Failed to update skill.' });
  }
});

const getSkills = asyncHandler(async (req, res) => {
  const { id } = req.user;

  const skills = await Skill.find({ createdBy: id }, { uuid: 0, createdBy:0, __v:0 });

  if (skills.length === 0) {
    return res.status(400).json({ status: false, message: 'No skills found for the user.' });
  }

  res.status(200).json({ status: true, skills });
});

const getSingleSkill = asyncHandler(async (req, res) => {
  const { uuid } = req.body;

  const skills = await Skill.find({_id:uuid }, { uuid: 0,_id:0, __v: 0 });

  if (skills.length === 0) {
    return res.status(200).json({ status: true, message: 'No skills found for the user with the given UUID.' });
  }

  const user = await User.find({_id:skills?.[0]?.createdBy}).select(' -password -uuid -updatedAt -__v -_id')

  res.status(200).json({ status: true, skill:skills?.[0], user });
});

const deleteSkill = asyncHandler(async (req, res) => {
  const { id } = req.user; // User UUID from the authenticated user
  const { skillUUID } = req.params;

  const skill = await Skill.findOne({ _id: skillUUID });

  if (!skill) {
    return res.status(404).json({ status: false, message: 'Skill not found.' });
  }

  if (skill.createdBy !== id) {
    return res.status(403).json({ status: false, message: 'You are not authorized to delete this skill.' });
  }

  await Skill.deleteOne({ _id: skillUUID });

  res.status(200).json({ status: true, message: 'Skill Removed successfully.' });
});

const GetAllSkillsPaginate = asyncHandler(async (req, res) => {
  const id = req.user.id; // Assuming you have middleware that extracts user ID from the headers

  // Pagination options
  const page = parseInt(req.body.page) || 1;
  const limit = parseInt(req.body.limit) || 10;
  const skip = (page - 1) * limit;
  // Filter options

  const filter = req.body.filter; // Filter by 'latest', 'oldest', 'most_requested', 'free', 'paid'
  let sort = req.body.sort || 'createdAt'; // Sort by 'createdAt' by default

  const query = { createdBy: { $ne: id } }; // Exclude current user's skills

  // Apply additional filters
  if (filter === 'latest') {
    sort = { createdAt: -1 };
  } else if (filter === 'oldest') {
    sort = { createdAt: 1 };
  } else if (filter === 'most_requested') {
    sort = { receivedSkill: -1 };
  } else if (filter === 'free') {
    query.priceTerm = "free";
  } else if (filter === 'paid') {
    query.priceTerm = "paid";
  }

  const skillsCount = await Skill.countDocuments(query);
  const skills = await Skill.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit).select('-uuid -__v -updatedAt')

    if (skills.length === 0) {
      return res.status(404).json({ message: 'No skills found.' });
    }
    
  const userIds = skills.map((skill) => skill.createdBy);
  const users = await User.find({ _id: { $in: userIds } }).select('name email country city createdAt github instagram website profile');

  const skillsWithUsers = skills.map((skill) => {
    const user = users.find((user) => user._id.toString() === skill.createdBy.toString());
    return {
      skill,
      user: {
        userName: user.name,
        userEmail: user.email,
        profile:user.profile,
        userLocation: {
          country: user.country,
          city: user.city,
        },
        userCreatedOn: user.createdAt,
        socialMedia:{
          github: user.github,
          instagram: user.instagram,
          website: user.website,
        }
      },
    };
  });
  res.json({
    skills:skillsWithUsers,
    currentPage: page,
    totalPages: Math.ceil(skillsCount / limit),
  });
});

module.exports = {
  createSkill,
  updateSkill,
  getSkills,
  deleteSkill,
  getSingleSkill,
  GetAllSkillsPaginate
};
