import express from 'express'
import * as controllers from '../controllers/blog.controllers.js'
const router = express.Router()

//POST
router.post('/create', controllers.newBlog)
router.post('/update', controllers.updateBlog)
router.post('/delete', controllers.deleteBlog)

//GET
router.get('/getBlogs', controllers.getBlogs)
router.get('/getBlog/:blogId', controllers.getBlog)

export default router