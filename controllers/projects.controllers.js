import { generateUniqueCode, sendResponse, uploadToCloudinary } from "../middlewares/utils.js"
import ProjectModel from "../model/Project.js"

export async function newProject(req, res) {
    const { title, description, link } = req.body
    const { image } = req.file || {}
    if(!title) return sendResponse(res, 400, false, 'Project Title is required')
    if(!description) return sendResponse(res, 400, false, 'Project Description is required')
    
    try {
        let imageUrl = null
        if(image?.[0]){
            imageUrl = uploadToCloudinary(image[0].buffer, 'project/images', 'image')
        }

        const uniqueId = await generateUniqueCode(9)
        const projectId = `INpr${uniqueId}PR`

        const newProject = await ProjectModel.create({ 
            image: imageUrl,
            title,
            description,
            link,
            projectId
        })

        sendResponse(res, 201, true, 'Project created')
    } catch (error) {
        console.log('UNABLE TO CREATE PROJECT', error)
        sendResponse(res, 500, false, 'Unable to create project')
    }
}

export async function updateProject(req, res) {
    const { projectId, title, description, link } = req.body
    const { image } = req.file || {}
    if(!projectId) return sendResponse(res, 400, false, 'Project Id is required')
    
    try {
        let imageUrl = null
        if(image?.[0]){
            imageUrl = uploadToCloudinary(image[0].buffer, 'project/images', 'image')
        }

        const getproject = await ProjectModel.findOne({ 
            projectId
        })
        if(!getproject) return sendResponse(res, 404, false, 'Project not Found')
        
        if(title) getproject.title = title
        if(description) getproject.description = description
        if(link) getproject.link = link
        if(imageUrl) getproject.image = imageUrl

        await getproject.save()

        sendResponse(res, 201, true, 'Project updated')
    } catch (error) {
        console.log('UNABLE TO UPDATE PROJECT', error)
        sendResponse(res, 500, false, 'Unable to update project')
    }
}

export async function deleteProject(req, res) {
    const { projectId } = req.body
    if(!projectId) return sendResponse(res, 400, false, 'Project Id is required')
    
    try {
        const getproject = await ProjectModel.findOneAndDelete({ 
            projectId
        })
        if(!getproject) return sendResponse(res, 404, false, 'Project not Found')
        
        sendResponse(res, 200, true, 'Project deleted')
    } catch (error) {
        console.log('UNABLE TO DELETE PROJECT', error)
        sendResponse(res, 500, false, 'Unable to delete project')
    }
}

export async function getProjects(req, res) {
    const { limit = 10, page = 1 } = req.query

    try {
        const skip = (page -1) * limit

        let projects = await ProjectModel.find()
        .skip(Number(skip))
        .limit(Number(limit))
        .select('-_id -__v')

        // Truncate description to 70 words
        projects = projects.map(project => {
            if (project.description) {
                const words = project.description.split(' ');
                if (words.length > 70) {
                    project.description = words.slice(0, 70).join(' ') + '...';
                }
            }
            return project;
        });

        const total = await ProjectModel.countDocuments()

        sendResponse(res, 200, true, {
                data: projects,
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            },
            'Projects fetched successful'
        )
    } catch (error) {
        console.log('UNABLE TO GET PROJECTS', error)
        sendResponse(res, 500, false, 'Unable to get projects')
    }
}

export async function getProject(req, res) {
    const { projectId } = req.params
    if(!projectId) return sendResponse(res, 400, false, 'Project Id is required')
    
    try {
        const getAProject = await ProjectModel.findOne({ projectId }).select('-_id -__v')
        if(!getAProject) return sendResponse(res, 404, false, 'project does not exist')

        sendResponse(res, 200, true, getAProject, 'Project fetched successful')
    } catch (error) {
        console.log('UNABLE TO GET PROJECT', error)
        sendResponse(res, 500, false, 'Unable to get project')
    }
}