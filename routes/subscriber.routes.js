import express from 'express'
import * as controllers from '../controllers/subscribe.controllers.js'
const router = express.Router()

//POST
router.post('/subscribe', controllers.subscribe)
router.post('/unSubscribe', controllers.unSubscribe)

//GET
router.get('/getSubscribers', controllers.getSubscribers)

export default router