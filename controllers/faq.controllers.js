import { generateUniqueCode, sendResponse } from "../middlewares/utils.js"
import FaqModel from "../model/Faq.js"

export async function newFaq(req, res) {
    const { question, answer } = req.body
    if(!question) return sendResponse(res, 400, false, 'Faq Question is required')
    if(typeof question !== 'string') return sendResponse(res, 400, false, 'Faq Question must be a string')
    if(!answer) return sendResponse(res, 400, false, 'Faq Answer is required')
    if(typeof answer !== 'string') return sendResponse(res, 400, false, 'Faq Answer is must be a string')
    
    try {
        const uniqueId = await generateUniqueCode(9)
        const faqId = `INpr${uniqueId}QA`

        const newFaq = await FaqModel.create({ 
            question,
            answer,
            faqId
        })

        sendResponse(res, 201, true, 'Faq created')
    } catch (error) {
        console.log('UNABLE TO CREATE FAQ', error)
        sendResponse(res, 500, false, 'Unable to create faq')
    }
}

export async function updateFaq(req, res) {
    const { faqId, question, answer } = req.body
    if(!faqId) return sendResponse(res, 400, false, 'Faq Id is required')
    
    try {

        const getFaq = await FaqModel.findOne({ 
            faqId
        })
        if(!getFaq) return sendResponse(res, 404, false, 'Faq not Found')
        
        if(question) getFaq.question = question
        if(answer) getFaq.answer = answer
        
        await getFaq.save()
        
        sendResponse(res, 201, true, 'Faq updated')
    } catch (error) {
        console.log('UNABLE TO UPDATE FAQ', error)
        sendResponse(res, 500, false, 'Unable to update faq')
    }
}

export async function deleteFaq(req, res) {
    const { faqId } = req.body
    if(!faqId) return sendResponse(res, 400, false, 'Faq Id is required')
    
    try {
        const getFaq = await FaqModel.findOneAndDelete({ 
            faqId
        })
        if(!getFaq) return sendResponse(res, 404, false, 'Faq not Found')
        
        sendResponse(res, 200, true, 'Faq deleted')
    } catch (error) {
        console.log('UNABLE TO DELETE FAQ', error)
        sendResponse(res, 500, false, 'Unable to delete faq')
    }
}

export async function getFaqs(req, res) {
    const { limit = 10, page = 1 } = req.query

    try {
        const skip = (page -1) * limit

        const faqData = await FaqModel.find()
        .skip(Number(skip))
        .limit(Number(limit))
        .select('-_id -__v')

        const total = await FaqModel.countDocuments()

        sendResponse(res, 200, true, {
                data: faqData,
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            },
            'Faq fetched successful'
        )
    } catch (error) {
        console.log('UNABLE TO GET FAQ', error)
        sendResponse(res, 500, false, 'Unable to get faq')
    }
}

export async function getFaq(req, res) {
    const { faqId } = req.params
    if(!faqId) return sendResponse(res, 400, false, 'Faq Id is required')
    
    try {
        const getAFaq = await FaqModel.findOne({ faqId }).select('-_id -__v')
        if(!getAFaq) return sendResponse(res, 404, false, 'Faq does not exist')

        sendResponse(res, 200, true, getAFaq, 'Faq fetched successful')
    } catch (error) {
        console.log('UNABLE TO GET FAQ', error)
        sendResponse(res, 500, false, 'Unable to get faq')
    }
}