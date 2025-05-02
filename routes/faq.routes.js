import express from 'express'
import * as controllers from '../controllers/faq.controllers.js'
const router = express.Router()

//POST
router.post('/create', controllers.newFaq)
router.post('/update', controllers.updateFaq)
router.post('/delete', controllers.deleteFaq)

//GET
router.get('/getFaqs', controllers.getFaqs)
router.get('/getFaq/:faqId', controllers.getFaq)

export default router