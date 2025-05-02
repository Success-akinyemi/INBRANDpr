import { generateUniqueCode, sendResponse, uploadToCloudinary } from "../middlewares/utils.js"
import TrainingProgramModel from "../model/TraningProgram.js"

export async function newTraining(req, res) {
    const { instructor, title, date, duration, tag, description } = req.body
    const { image } = req.file || {}
    if(!instructor) return sendResponse(res, 400, false, 'Training Instructor is required')
    if(!title) return sendResponse(res, 400, false, 'Training Title is required')
    if(!description) return sendResponse(res, 400, false, 'Training Description is required')
    if(!tag) return sendResponse(res, 400, false, 'Training Tags is required')
    if(!Array.isArray(tag)) return sendResponse(res, 400, false, 'Tag must be an array')
    if(tag.length < 1) return sendResponse(res, 400, false, 'Tag must contain at least one string')
    if(!tag.every(item => typeof item === 'string')) return sendResponse(res, 400, false, 'All data of tag array must be string')
    if(!date) return sendResponse(res, 400, false, 'Date is required')
    
    try {
        let imageUrl = null
        if(image?.[0]){
            imageUrl = uploadToCloudinary(image[0].buffer, 'training/images', 'image')
        }

        const uniqueId = await generateUniqueCode(9)
        const trainingId = `INpr${uniqueId}TR`

        const newTraining = await TrainingProgramModel.create({ 
            instructor,
            title,
            date,
            duration,
            tag,
            description,
            trainingId,
            image
        })

        sendResponse(res, 201, true, 'Training program created')
    } catch (error) {
        console.log('UNABLE TO CREATE TRAINING PROGRAM', error)
        sendResponse(res, 500, false, 'Unable to create training program')
    }
}

export async function updateTraining(req, res) {
    const { trainingId, instructor, title, date, duration, tag, description } = req.body
    const { image } = req.file || {}
    if(!trainingId) return sendResponse(res, 400, false, 'Training Id is required')
    
    try {
        let imageUrl = null
        if(image?.[0]){
            imageUrl = uploadToCloudinary(image[0].buffer, 'training/images', 'image')
        }

        const getTraining = await TrainingProgramModel.findOne({ 
            trainingId
        })
        if(!getTraining) return sendResponse(res, 404, false, 'training program not Found')
        
        if(instructor) getTraining.instructor = instructor
        if(title) getTraining.title = title
        if(date) getTraining.date = date
        if(duration) getTraining.duration = duration
        if(tag) getTraining.tag = tag
        if(description) getTraining.description = description
        if(imageUrl) getTraining.image = imageUrl

        await getTraining.save()

        sendResponse(res, 201, true, 'Training program updated')
    } catch (error) {
        console.log('UNABLE TO UPDATE TRAINING PROGRAM', error)
        sendResponse(res, 500, false, 'Unable to update training program')
    }
}

export async function deleteTraining(req, res) {
    const { trainingId } = req.body
    if(!trainingId) return sendResponse(res, 400, false, 'Training program Id is required')
    
    try {
        const getTraining = await TrainingProgramModel.findOneAndDelete({ 
            trainingId
        })
        if(!getTraining) return sendResponse(res, 404, false, 'Training program not Found')
        
        sendResponse(res, 200, true, 'Training program deleted')
    } catch (error) {
        console.log('UNABLE TO DELETE TRAINING PROGRAM', error)
        sendResponse(res, 500, false, 'Unable to delete training program')
    }
}

export async function getTrainingPrograms(req, res) {
    const { limit = 10, page = 1 } = req.query

    try {
        const skip = (page -1) * limit

        let services = await TrainingProgramModel.find()
        .skip(Number(skip))
        .limit(Number(limit))
        .select('-_id -__v')

        // Truncate description to 70 words
        services = services.map(service => {
            if (service.description) {
                const words = service.description.split(' ');
                if (words.length > 70) {
                    service.description = words.slice(0, 70).join(' ') + '...';
                }
            }
            return service;
        });

        const total = await TrainingProgramModel.countDocuments()

        sendResponse(res, 200, true, {
                data: services,
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            },
            'Training programs fetched successful'
        )
    } catch (error) {
        console.log('UNABLE TO GET TRAINING PROGRAMS', error)
        sendResponse(res, 500, false, 'Unable to get training programs')
    }
}

export async function getTrainingProgram(req, res) {
    const { trainingId } = req.params
    if(!trainingId) return sendResponse(res, 400, false, 'Training program Id is required')
    
    try {
        const getTraining = await TrainingProgramModel.findOne({ trainingId }).select('-_id -__v')
        if(!getTraining) return sendResponse(res, 404, false, 'Training program does not exist')

        sendResponse(res, 200, true, getTraining, 'Training programs fetched successful')
    } catch (error) {
        console.log('UNABLE TO GET TRAINING PROGRAMS', error)
        sendResponse(res, 500, false, 'Unable to get training programs')
    }
}