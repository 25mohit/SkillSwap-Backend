const asyncHandler = require('express-async-handler')
const User = require('../Modals/UserModal')
const Skills = require('../Modals/SkillsModal')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Bookmark = require('../Modals/BookmarkModal');

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, mobile, country, state, city, password, userName } = req.body;

  if (!name || !email || !mobile || !password || !country || !state || !city || !userName) {
    return res.status(400).json({ status: false, message: 'All fields are required' });
  }

  const existingUserNameUser = await User.exists({ userName });
  
  if (existingUserNameUser !== null) {
    return res.status(400).json({ status: false, message: 'Username already exists' });
  }

  const isUserExists = await User.findOne({ $or: [{ email }, { mobile }] });
  if (isUserExists) {
    return res.status(400).json({ status: false, message: 'User already exists' });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashPassword,
    mobile,
    country,
    state,
    city,
    userName: userName.toLowerCase(),
  });

  if (user) {
    return res.status(201).json({ status: true, message: 'User registered successfully' });
  } else {
    return res.status(400).json({ status: false, message: 'Unable to create user, please try again later' });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: false, message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ status: false, message: 'Invalid email or password.' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({ status: false, message: 'Invalid email or password.' });
  }
  const token = jwt.sign(
    {
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      country: user.country,
      id: user._id
    },
    process.env.JWT_SECRET_KEY, // Replace with your own secret key for signing the token
    { expiresIn: '4d',  noTimestamp: true  } // Token expiry set to 4 days
  );
  res.status(200).json({ status: true, message: 'Logged in successfully.', token });
});

const getProfile = asyncHandler(async (req, res) => {
  const { id } = req.user; // User UUID from the authenticated user

  const user = await User.findOne({ _id: id }).select('-password -_id -uuid -__v -createdAt -updatedAt');

  if (!user) {
    return res.status(404).json({ status: false, message: 'User not found.' });
  }

  res.status(200).json({ status: true, data: user });
});

const updatePassword = asyncHandler(async (req, res) => {
  const { id } = req.user; // User UUID from the authenticated user
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ status: false, message: 'Current password and new password are required.' });
  }

  const user = await User.findOne({ _id: id });

  if (!user) {
    return res.status(404).json({ status: false, message: 'User not found.' });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    return res.status(400).json({ status: false, message: 'Current password is incorrect.' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  res.status(200).json({ status: true, message: 'Password updated successfully.' });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { id } = req.user; // User UUID from the authenticated user
  const { mobile, country, state, city,profile,designation, employeer, linkedin, website, facebook, twitter, instagram, github, userName } = req.body;

  if ( !mobile || !country || !state || !city || !userName) {
    return res.status(400).json({ status: false, message: 'All fields are required.' });
  }

  const existingUser = await User.findOne({ _id: id });

  if (!existingUser) {
    return res.status(404).json({ status: false, message: 'User not found.' });
  }

  existingUser.userName = userName.toLowerCase();
  existingUser.mobile = mobile;
  existingUser.country = country;
  existingUser.state = state;
  existingUser.city = city;
  existingUser.designation = designation;
  existingUser.employeer = employeer;
  existingUser.profile = profile;
  existingUser.github = github ? `https://www.github.com/${github}` : null;
  existingUser.instagram =instagram ? `https://www.instagram.com/${instagram}` : null;
  existingUser.twitter = twitter ? `https://www.twitter.com/${twitter}` : null;
  existingUser.facebook = facebook ? `https://www.facebook.com/${facebook}` : null;
  existingUser.website = website ? `https://www.${website}` : null;
  existingUser.linkedin = linkedin ? `https://www.linkedin.com/in/${linkedin}` : null;

  await existingUser.save();

  res.status(200).json({ status: true, message: 'Profile updated successfully.' });
});

const getUsersPublicProfile = asyncHandler(async (req, res, next) => {
const {userName} = req.params

if (!userName) {
  return res.status(400).json({ status: false, message: 'User name parameter is missing' });
}
const user = await User.findOne({userName: userName?.split('@')?.[1]}).select('-password -updatedAt -createdAt -uuid -__v')
    
  if (!user) {
    return res.status(404).json({ status:false, error: 'User not found' });
  }

  // Find the skills associated with the user
  const skills = await Skills.find({ createdBy: user._id }).select('-_id -createdAt -uuid -__v -updatedAt -createdBy');

  return res.status(200).json({ status: true,
    user,
    skills,
  });
});

const createBookmark = asyncHandler(async (req, res) => {
  const { skillId } = req.body;
  const id = req.user.id; // Assuming user ID is available in the req.user object

  // Check if the bookmark already exists
  const existingBookmark = await Bookmark.findOne({ skill: skillId, user: id });
  if (existingBookmark) {
    return res.status(400).json({ status: false, message: 'Bookmark already exists' });
  }


  // Check if the skill exists
  const skill = await Skills.findById({_id: skillId});
  if (!skill) {
    return res.status(404).json({ status: false, message: 'Skill not found' });
  }

  if (skill.createdBy === id) {
    return res.status(400).json({ status: false, message: "You can't bookmark your own skill" });
  }

  // Create a new bookmark
  const bookmark = new Bookmark({
    skill: skillId,
    user: id,
    skillName: skill.skillName,
    skillDescription: skill.skillDescription,
    skillTechnologies: skill.skillTechnologies,
    createdBy: skill.createdBy,
    createdAt: skill.createdAt,
    skillVisibility: skill.skillVisibility,
    skillLevel: skill.skillLevel,
    priceTerm: skill.priceTerm,
    // Add any other relevant data you want to include with the bookmark
  });

  // Save the bookmark
  await bookmark.save();

  res.status(201).json({ success: true, message:"Bookmark added" });
});

const getBookmarks = asyncHandler(async (req, res) => {
  const id = req.user.id; // Assuming user ID is available in the req header with the key 'usid'

  // Find the bookmarks for the current user
  const bookmarks = await Bookmark.find({ user: id }).select('-_id -__v -user -skill -createdBy -updatedAt');

  if(!bookmarks){
    return res.status(400).json({status: false, message: "You have not Bookmarked any skill"})
  }
  return res.status(200).json({ success: true, bookmarks });
});

const removeBookmark = asyncHandler(async (req, res) => {
  const bookmarkId = req.params.bookmarkId; // Assuming bookmark BOOKMARKID is available in the request params
  const id = req.user.id; // Assuming user ID is available in the req header with the key 'usid'

  // Find the bookmark for the current user
  const result = await Bookmark.deleteOne({ _id: bookmarkId, user: id });

  if (result.deletedCount === 0) {
    return res.status(404).json({ status: false, message: 'Bookmark not found' });
  }

  res.status(200).json({ success: true, message: 'Bookmark removed' });
});

module.exports = {
    registerUser,
    loginUser,
    updateProfile,
    updatePassword,
    getProfile,
    getUsersPublicProfile,
    createBookmark,
    getBookmarks,
    removeBookmark
}