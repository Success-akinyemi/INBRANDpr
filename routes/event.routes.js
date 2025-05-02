import express from 'express'
import * as controllers from '../controllers/event.controllers.js'
const router = express.Router()

//POST
router.post('/create', controllers.newEvent)
router.post('/update', controllers.updateEvent)
router.post('/delete', controllers.deleteEvent)

//GET
router.get('/getEvents', controllers.getEvents)
router.get('/getEvent/:eventId', controllers.getEvent)

export default router