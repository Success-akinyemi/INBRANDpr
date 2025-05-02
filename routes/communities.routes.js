import express from 'express'
import * as controllers from '../controllers/community.controllers.js'
const router = express.Router()

//POST
router.post('/create', controllers.newCommuntiy)
router.post('/update', controllers.updateCommunity)
router.post('/delete', controllers.deleteCommunity)

//GET
router.get('/getCommunities', controllers.getCommunities)
router.get('/getCommunity/:communityId', controllers.getCommunity)

export default router