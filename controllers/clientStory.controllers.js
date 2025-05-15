import { generateUniqueCode, sendResponse, uploadToCloudinary } from "../middlewares/utils.js"
import ClientStoryModel from "../model/ClientStroy.js"

export async function newStroy(req, res) {
    const { story, name, role, ratings } = req.body
    const { image } = req.file || {}
    if(!story) return sendResponse(res, 400, false, 'Client Story is required')
    if(!name) return sendResponse(res, 400, false, 'Client Name is required')
    
    try {
        let imageUrl = null
        if(image?.[0]){
            imageUrl = await uploadToCloudinary(image[0].buffer, 'clientStory/images', 'image')
        }

        const uniqueId = await generateUniqueCode(9)
        const storyId = `INpr${uniqueId}CS`

        const newProject = await ClientStoryModel.create({ 
            storyId,
            name,
            story,
            role,
            ratings,
            image: imageUrl,
        })

        sendResponse(res, 201, true, 'Client story created')
    } catch (error) {
        console.log('UNABLE TO CREATE CLIENT STORY', error)
        sendResponse(res, 500, false, 'Unable to create client story')
    }
}

export async function updateStory(req, res) {
    const { storyId, name, story, role, ratings } = req.body
    const { image } = req.file || {}
    if(!storyId) return sendResponse(res, 400, false, 'Story Id is required')
    
    try {
        let imageUrl = null
        if(image?.[0]){
            imageUrl = await uploadToCloudinary(image[0].buffer, 'clientStory/images', 'image')
        }

        const getStroy = await ClientStoryModel.findOne({ 
            storyId
        })
        if(!getStroy) return sendResponse(res, 404, false, 'Project not Found')
        
        if(name) getStroy.name = name
        if(story) getStroy.story = story
        if(role) getStroy.role = role
        if(ratings) getStroy.ratings = ratings
        if(imageUrl) getStroy.image = imageUrl

        await getStroy.save()

        sendResponse(res, 201, true, 'Client Story updated')
    } catch (error) {
        console.log('UNABLE TO UPDATE CLIENT STORY', error)
        sendResponse(res, 500, false, 'Unable to update client story')
    }
}

export async function deleteStory(req, res) {
    const { storyId } = req.body
    if(!storyId) return sendResponse(res, 400, false, 'Client Stroy Id is required')
    
    try {
        const getStroy = await ClientStoryModel.findOneAndDelete({ 
            storyId
        })
        if(!getStroy) return sendResponse(res, 404, false, 'Client Stroy not Found')
        
        sendResponse(res, 200, true, 'Client Stroy deleted')
    } catch (error) {
        console.log('UNABLE TO DELETE PROJECT', error)
        sendResponse(res, 500, false, 'Unable to delete client story')
    }
}

export async function getStories(req, res) {
    const { limit = 10, page = 1 } = req.query

    try {
        const skip = (page -1) * limit

        let stories = await ClientStoryModel.find()
        .skip(Number(skip))
        .limit(Number(limit))
        .select('-_id -__v')

        const total = await ClientStoryModel.countDocuments()

        sendResponse(res, 200, true, {
                data: stories,
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            },
            'Client Stories fetched successful'
        )
    } catch (error) {
        console.log('UNABLE TO GET CLIENT STORIES', error)
        sendResponse(res, 500, false, 'Unable to get client stories')
    }
}

export async function getStory(req, res) {
    const { storyId } = req.params
    if(!storyId) return sendResponse(res, 400, false, 'Client Story Id is required')
    
    try {
        const getAStory = await ClientStoryModel.findOne({ storyId }).select('-_id -__v')
        if(!getAStory) return sendResponse(res, 404, false, 'Client Story does not exist')

        sendResponse(res, 200, true, getAStory, 'Client Story fetched successful')
    } catch (error) {
        console.log('UNABLE TO GET CLIENT STORY', error)
        sendResponse(res, 500, false, 'Unable to get client story')
    }
}