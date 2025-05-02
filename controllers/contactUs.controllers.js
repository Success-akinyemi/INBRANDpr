import { generateUniqueCode, sendResponse } from "../middlewares/utils.js"
import ContactUsModel from "../model/ContactUs.js"

export async function sendMessage(req, res) {
    const { firstName, lastName, email, message } = req.body
    if(!firstName) return sendResponse(res, 400, false, 'First name is required')
    if(!lastName) return sendResponse(res, 400, false, 'Last name is required')
    if(!email) return sendResponse(res, 400, false, 'Email address is required')
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!emailRegex.test(email)) return sendResponse(res, 400, false, 'Please enter a valid email address')    
    if(!message) return sendResponse(res, 400, false, 'Message is required')
    
    try {
        const uniqueId = await generateUniqueCode(9)
        const messageId = `GE${uniqueId}MSG`    

        const newMessage = await ContactUsModel.create({
            messageId,
            firstName,
            lastName,
            email,
            message
        })

        sendResponse(res, 201, true, 'Message send successful')
    } catch (error) {
        console.log('UNABLE TO SEND MESSAGE', error)
        sendResponse(res, 400, false, 'Unable to send message')
    }
}

export async function replyMessage(req, res) {
    const { messageId, replyMessage } = req.body
    if(!messageId) return sendResponse(res, 400, false, 'Message Id is required')
    if(!replyMessage) return sendResponse(res, 400, false, 'Reply message is required')
    
    try {
        const getMessage = await ContactUsModel.findOne({ messageId })
        if(!getMessage) return sendResponse(res, 404, false, 'Message not found')

        sendResponse(res, 200, true, 'Message sent')
    } catch (error) {
        console.log('UNABLE TO REPLY CONTACT US MESSAGE', error)
        sendResponse(res, 500, false, 'Unable to reply contact message')
    }
}

export async function deleteMessage(req, res) {
    const { messageId } = req.params
    if(!messageId) return sendResponse(res, 400, false, 'Message Id is required')
    
    try {
        const getAMessage = await ContactUsModel.findOneAndDelete({ messageId }).select('-_id -__v')
        if(!getAMessage) return sendResponse(res, 404, false, 'Message not found')
        
        sendResponse(res, 200, true, 'Message Deleted successful')
    } catch (error) {
        console.log('UNABLE TO DELETE MESSAGE', error)
        sendResponse(res, 500, false, 'Unable to delete message')
    }
}

export async function getMessages(req, res) {
    const { limit = 10, page = 1, search, replied } = req.query;
    let query = {};

    try {
        const numericLimit = Number(limit);
        const numericPage = Number(page);
        const skip = (numericPage - 1) * numericLimit;

        // Apply search filter if search is provided
        if (search) {
            query = {
                email: { $regex: search, $options: 'i' } // case-insensitive partial match
            };
        }

        if(replied && replied === true) {
            query.replied = true
        }
        if(replied && replied === false) {
            query.replied = false
        }

        const subscribersData = await SubscriberModel.find(query)
            .skip(skip)
            .limit(numericLimit)
            .select('-_id -__v');

        const total = await SubscriberModel.countDocuments(query);

        sendResponse(res, 200, true, {
            data: subscribersData,
            total,
            page: numericPage,
            limit: numericLimit,
            totalPages: Math.ceil(total / numericLimit)
        }, 'Messages fetched successfully');
    } catch (error) {
        console.log('UNABLE TO GET MESSAGES', error);
        sendResponse(res, 500, false, 'Unable to get contact us message');
    }
}

export async function getMessage(req, res) {
    const { messageId } = req.params
    if(!messageId) return sendResponse(res, 400, false, 'Message Id is required')
    
    try {
        const getAMessage = await ContactUsModel.findOne({ messageId }).select('-_id -__v')
        if(!getAMessage) return sendResponse(res, 404, false, 'Message not found')
        
        sendResponse(res, 200, true, getAMessage, 'Message fetched successful')
    } catch (error) {
        console.log('UNABLE TO GET MESSAGE', error)
        sendResponse(res, 500, false, 'Unable to get message')
    }
}