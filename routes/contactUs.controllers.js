import express from 'express'
import * as controllers from '../controllers/contactUs.controllers.js'
const router = express.Router()

//POST
router.post('/sendMessage', controllers.sendMessage)
router.post('/replyMessage', controllers.replyMessage)
router.post('/delete', controllers.deleteMessage)

//GET
router.get('/getMessages', controllers.getMessages)
router.get('/getMessage/:messageId', controllers.getMessage)

export default router