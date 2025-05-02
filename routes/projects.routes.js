import express from 'express'
import * as controllers from '../controllers/projects.controllers.js'
import { uploadMiddleware } from '../middlewares/utils.js'
const router = express.Router()

//POST
router.post('/create', uploadMiddleware, controllers.newProject)
router.post('/update', uploadMiddleware, controllers.updateProject)
router.post('/delete', controllers.deleteProject)

//GET
router.get('/getProjects', controllers.getProjects)
router.get('/getProject/:projectId', controllers.getProject)

export default router