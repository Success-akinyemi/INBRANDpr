import express from 'express'
import * as controllers from '../controllers/trainingProgram.controllers.js'
import { uploadMiddleware } from '../middlewares/utils.js'
const router = express.Router()

//POST
router.post('/create', uploadMiddleware, controllers.newTraining)
router.post('/update', uploadMiddleware, controllers.updateTraining)
router.post('/delete', controllers.deleteTraining)

//GET
router.get('/getTrainingPrograms', controllers.getTrainingPrograms)
router.get('/getTrainingProgram/:trainingId', controllers.getTrainingProgram)

export default router