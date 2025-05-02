import { sendResponse } from "../middlewares/utils.js"
import SubscriberModel from "../model/Subscriber.js";


export async function subscribe(req, res) {
    const { email } = req.body
    if(!email) return sendResponse(res, 400, false, 'Email Address is required')
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!emailRegex.test(email)) return sendResponse(res, 400, false, 'Please enter a valid email address')    

    try {
        const newSubscriber = await SubscriberModel.create({ email })
        
        sendResponse(res, 201, true, 'Email Subscribed successful')
    } catch (error) {
        console.log('UNABLE TO SUBSCRIBE USER EMAIL TO SUBSCRIBERS LIST', error)
        sendResponse(res, 500, false, 'Unable to subscribe email')
    }
}

export async function unSubscribe(req, res) {
    const { email } = req.body
    if(!email) return sendResponse(res, 400, false, 'Email Address is required')
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!emailRegex.test(email)) return sendResponse(res, 400, false, 'Please enter a valid email address')    

    try {
        const newSubscriber = await SubscriberModel.findOneAndDelete({ email })
        if(!newSubscriber) return sendResponse(res, 404, false, 'Email not found')

        sendResponse(res, 201, true, 'Email UnSubscribed successful')
    } catch (error) {
        console.log('UNABLE TO SUBSCRIBE USER EMAIL TO SUBSCRIBERS LIST', error)
        sendResponse(res, 500, false, 'Unable to subscribe email')
    }
}

export async function getSubscribers(req, res) {
    const { limit = 10, page = 1, search } = req.query;
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
        }, 'Subscribers fetched successfully');
    } catch (error) {
        console.log('UNABLE TO GET SUBSCRIBERS', error);
        sendResponse(res, 500, false, 'Unable to get subscribers');
    }
}
