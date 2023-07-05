const express = require('express')
const { createSkill, updateSkill, getSkills, deleteSkill, getSingleSkill, GetAllSkillsPaginate } = require('../Controller/SkillsController')
const verifyUser = require('../Middleware/VerifyUser')
const router = express.Router()

router.post('/create', verifyUser, createSkill)
router.patch('/update/:skillId',verifyUser, updateSkill)
router.get('/my-skills',verifyUser, getSkills)
router.post('/my-single-skill',verifyUser, getSingleSkill)
router.delete('/delete/:skillUUID',verifyUser, deleteSkill)
router.post('/get-all-skills',verifyUser, GetAllSkillsPaginate)

module.exports = router