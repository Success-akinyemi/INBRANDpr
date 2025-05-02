import express from 'express'
import * as controllers from '../controllers/services.controllers.js'
import { uploadMiddleware } from '../middlewares/utils.js'
const router = express.Router()

//POST
router.post('/create', uploadMiddleware, controllers.newService)
router.post('/update', uploadMiddleware, controllers.updateService)
router.post('/delete', controllers.deleteService)

//GET
router.get('/getServices', controllers.getServices)
router.get('/getService/:serviceId', controllers.getService)

export default router