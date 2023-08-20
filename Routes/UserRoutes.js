const express = require('express')
const { registerUser, loginUser, updateProfile, updatePassword, getProfile, getUsersPublicProfile, createBookmark, getBookmarks, removeBookmark } = require('../Controller/UserController')
const verifyUser = require('../Middleware/VerifyUser')
const { GetNotifications } = require('../Controller/NotificationController')
const { SendSkillSwapRequest, HandleSkillSwapRequest } = require('../Controller/SkillSwapController')
const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile',verifyUser,  getProfile)
router.patch('/profile-update', verifyUser,  updateProfile)
router.patch('/update-password', verifyUser, updatePassword)
router.get('/notification', verifyUser,  GetNotifications)
router.post('/swap-skill-request', verifyUser,  SendSkillSwapRequest)
router.post('/handle-swap-skill-request', verifyUser,  HandleSkillSwapRequest)
router.post('/public-profile/:userName', getUsersPublicProfile)

// BOOKMARK ROUTES
router.post('/bookmark', verifyUser,  createBookmark)
router.get('/bookmark-get', verifyUser,  getBookmarks)
router.delete('/bookmark-remove/:bookmarkId', verifyUser,  removeBookmark)

module.exports = router