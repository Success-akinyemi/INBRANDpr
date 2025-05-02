import { generateUniqueCode, sendResponse, uploadToCloudinary } from "../middlewares/utils.js"
import TeamMembersModel from "../model/TeamMembers.js"

export async function newMember(req, res) {
    const { name, position, bio } = req.body
    const { image } = req.file || {}
    if(!name) return sendResponse(res, 400, false, 'Member Name is required')
    if(!position) return sendResponse(res, 400, false, 'Member Position is required')
    
    try {
        let imageUrl = null
        if(image?.[0]){
            imageUrl = uploadToCloudinary(image[0].buffer, 'teamMembers/images', 'image')
        }

        const uniqueId = await generateUniqueCode(9)
        const memberId = `INpr${uniqueId}TM`

        const newService = await TeamMembersModel.create({ 
            memberId,
            name,
            position,
            bio,
            image: imageUrl,
        })

        sendResponse(res, 201, true, 'Team members created')
    } catch (error) {
        console.log('UNABLE TO CREATE TEAM MEMBERS', error)
        sendResponse(res, 500, false, 'Unable to create team member')
    }
}

export async function updateMember(req, res) {
    const { memberId, name, position, bio } = req.body
    const { image } = req.file || {}
    if(!memberId) return sendResponse(res, 400, false, 'Team member Id is required')
    
    try {
        let imageUrl = null
        if(image?.[0]){
            imageUrl = uploadToCloudinary(image[0].buffer, 'services/images', 'image')
        }

        const getMember = await TeamMembersModel.findOne({ 
            memberId
        })
        if(!getMember) return sendResponse(res, 404, false, 'Team member not Found')
        
        if(name) getMember.name = name
        if(position) getMember.position = position
        if(bio) getMember.bio = bio
        if(imageUrl) getMember.image = imageUrl
        
        await getMember.save()

        sendResponse(res, 201, true, 'Team member updated')
    } catch (error) {
        console.log('UNABLE TO UPDATE TEAM MEMBER', error)
        sendResponse(res, 500, false, 'Unable to update team member')
    }
}

export async function deleteMember(req, res) {
    const { memberId } = req.body
    if(!memberId) return sendResponse(res, 400, false, 'Team member Id is required')
    
    try {
        const getMember = await TeamMembersModel.findOneAndDelete({ 
            memberId
        })
        if(!getMember) return sendResponse(res, 404, false, 'Team member not Found')
        
        sendResponse(res, 200, true, 'Team member deleted')
    } catch (error) {
        console.log('UNABLE TO DELETE TEAM MEMBER', error)
        sendResponse(res, 500, false, 'Unable to delete team member')
    }
}

export async function getTeamMembers(req, res) {
    const { limit = 10, page = 1 } = req.query

    try {
        const skip = (page -1) * limit

        const services = await TeamMembersModel.find()
        .skip(Number(skip))
        .limit(Number(limit))
        .select('-_id -__v')

        const total = await TeamMembersModel.countDocuments()

        sendResponse(res, 200, true, {
                data: services,
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            },
            'Team member fetched successful'
        )
    } catch (error) {
        console.log('UNABLE TO GET TEAM MEMBER', error)
        sendResponse(res, 500, false, 'Unable to get team member')
    }
}

export async function getTeamMember(req, res) {
    const { memberId } = req.params
    if(!memberId) return sendResponse(res, 400, false, 'Team member Id is required')
    
    try {
        const getATeamMember = await TeamMembersModel.findOne({ memberId }).select('-_id -__v')
        if(!getATeamMember) return sendResponse(res, 404, false, 'Team member does not exist')

        sendResponse(res, 200, true, getATeamMember, 'Team member fetched successful')
    } catch (error) {
        console.log('UNABLE TO GET TEAM MEMBER', error)
        sendResponse(res, 500, false, 'Unable to get team member')
    }
}