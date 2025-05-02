import express from 'express'
import * as controllers from '../controllers/teamMembers.controllers.js'
import { uploadMiddleware } from '../middlewares/utils.js'
const router = express.Router()

//POST
router.post('/create', uploadMiddleware, controllers.newMember)
router.post('/update', uploadMiddleware, controllers.updateMember)
router.post('/delete', controllers.deleteMember)

//GET
router.get('/getTeamMembers', controllers.getTeamMembers)
router.get('/getTeamMember/:memberId', controllers.getTeamMember)

export default router