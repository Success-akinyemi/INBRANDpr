import { generateUniqueCode, sendResponse, uploadToCloudinary } from "../middlewares/utils.js"
import ServicesModel from "../model/Services.js"

export async function newService(req, res) {
    const { title, description, ctaLink } = req.body
    const { image } = req.file || {}
    if(!title) return sendResponse(res, 400, false, 'Service Title is required')
    if(!description) return sendResponse(res, 400, false, 'Service Description is required')
    
    try {
        let imageUrl = null
        if(image?.[0]){
            imageUrl = uploadToCloudinary(image[0].buffer, 'services/images', 'image')
        }

        const uniqueId = await generateUniqueCode(9)
        const serviceId = `INpr${uniqueId}SE`

        const newService = await ServicesModel.create({ 
            image: imageUrl,
            title,
            description,
            ctaLink,
            serviceId
        })

        sendResponse(res, 201, true, 'Service created')
    } catch (error) {
        console.log('UNABLE TO CREATE SERVICES', error)
        sendResponse(res, 500, false, 'Unable to create service')
    }
}

export async function updateService(req, res) {
    const { serviceId, title, description, ctaLink } = req.body
    const { image } = req.file || {}
    if(!serviceId) return sendResponse(res, 400, false, 'Service Id is required')
    
    try {
        let imageUrl = null
        if(image?.[0]){
            imageUrl = uploadToCloudinary(image[0].buffer, 'services/images', 'image')
        }

        const getService = await ServicesModel.findOne({ 
            serviceId
        })
        if(!getService) return sendResponse(res, 404, false, 'Service not Found')
        
        if(title) getService.title = title
        if(description) getService.description = description
        if(ctaLink) getService.ctaLink = ctaLink
        if(imageUrl) getService.image = imageUrl
        
        await getService.save()

        sendResponse(res, 201, true, 'Service updated')
    } catch (error) {
        console.log('UNABLE TO UPDATE SERVICES', error)
        sendResponse(res, 500, false, 'Unable to update service')
    }
}

export async function deleteService(req, res) {
    const { serviceId } = req.body
    if(!serviceId) return sendResponse(res, 400, false, 'Service Id is required')
    
    try {
        const getService = await ServicesModel.findOneAndDelete({ 
            serviceId
        })
        if(!getService) return sendResponse(res, 404, false, 'Service not Found')
        
        sendResponse(res, 200, true, 'Service deleted')
    } catch (error) {
        console.log('UNABLE TO DELETE SERVICE', error)
        sendResponse(res, 500, false, 'Unable to delete service')
    }
}

export async function getServices(req, res) {
    const { limit = 10, page = 1 } = req.query

    try {
        const skip = (page -1) * limit

        const services = await ServicesModel.find()
        .skip(Number(skip))
        .limit(Number(limit))
        .select('-_id -__v')

        const total = await ServicesModel.countDocuments()

        sendResponse(res, 200, true, {
                data: services,
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            },
            'Services fetched successful'
        )
    } catch (error) {
        console.log('UNABLE TO GET SERVICES', error)
        sendResponse(res, 500, false, 'Unable to get services')
    }
}

export async function getService(req, res) {
    const { serviceId } = req.params
    if(!serviceId) return sendResponse(res, 400, false, 'Serivce Id is required')
    
    try {
        const getAService = await ServicesModel.findOne({ serviceId }).select('-_id -__v')
        if(!getAService) return sendResponse(res, 404, false, 'Service does not exist')

        sendResponse(res, 200, true, getAService, 'Service fetched successful')
    } catch (error) {
        console.log('UNABLE TO GET SERVICE', error)
        sendResponse(res, 500, false, 'Unable to get service')
    }
}