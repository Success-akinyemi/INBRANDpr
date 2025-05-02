import express from 'express'
import * as controllers from '../controllers/clientStory.controllers.js'
const router = express.Router()

//POST
router.post('/create', controllers.newStroy)
router.post('/update', controllers.updateStory)
router.post('/delete', controllers.deleteStory)

//GET
router.get('/getStories', controllers.getStories)
router.get('/getStory/:storyId', controllers.getStory)

export default router