import { sendResponse } from "../middlewares/utils.js"
import EventModel from "../model/Event.js";
import EventCategoryModel from "../model/EventCategory.js";

const isValidEventDate = (dateStr) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;

    const date = new Date(dateStr);
    const [year, month, day] = dateStr.split('-').map(Number);

    return (
        date.getFullYear() === year &&
        date.getMonth() + 1 === month && // JS months are 0-based
        date.getDate() === day
    );
};

export async function newEvent(req, res) {
    const { title, abstract, introduction, content, conclusion, author, category, eventDate } = req.body
    const { image, authorImage } = req.file || {}
    if(!title) return sendResponse(res, 400, false, 'Blog Title is required')
    if(!abstract) return sendResponse(res, 400, false, 'Blog Abstract is required')
    if(!content) return sendResponse(res, 400)
    if(!category) return sendResponse(res, 400, false, 'Category is required')
    if(category?.length < 1) return sendResponse(res, 400, false, 'Category needs at least one category')
    if(!Array.isArray(category)) return sendResponse(res, 400, false, 'Category must be an array')
    if(!eventDate) return sendResponse(res, 400, false, 'Event Date is required')
    if (!isValidEventDate(eventDate)) return sendResponse(res, 400, false, 'eventDate must be in the format YYYY-MM-DD')

    try {
        //check category and create if not exist
        const categories = await Promise.all(category.map(async (cat) => {
            const categorySlug = cat.toLowerCase().replace(/\s/g, '-');
            const category = await EventCategoryModel.findOne({ slug: categorySlug });
            if (!category) {
                // Create a slug from the category name also remove spaces and make it one word all lower case

                const newCategory = new EventCategoryModel({ name: cat, slug: categorySlug });
                await newCategory.save();
                return newCategory._id;
            }
            return {_id: category._id.toString(), name: category.name};
        }));

        let imageUrl = null
        if(image?.[0]){
            imageUrl = await uploadToCloudinary(image[0].buffer, 'event/images', 'image')
        }

        let authorImageUrl = null
        if(authorImage?.[0]){
            authorImageUrl = uploadToCloudinary(authorImage[0].buffer, 'author/images', 'image')
        }

        const uniqueCode = await generateUniqueCode(9)
        const eventId = `INpr${uniqueCode}EV`

        const newEvent = await EventModel.create({
            eventId,
            title,
            abstract,
            introduction,
            content,
            conclusion,
            author,
            authorImage: authorImageUrl,
            category: categories,
            image: imageUrl,
            eventDate
        })

        sendResponse(res, 201, true, 'Event created')
    } catch (error) {
        console.log('UNABLE TO CREATE EVENT', error)
        sendResponse(res, 500, false, 'Unable to create event')
    }
}

export async function updateEvent(req, res) {
    const { eventId, title, abstract, introduction, content, conclusion, author, category, eventDate } = req.body
    const { image, authorImage } = req.file || {}
    if(!eventId) return sendResponse(res, 400, false, 'Blog Id is required')
    if(category) {
        if(category?.length < 1) return sendResponse(res, 400, false, 'Category needs at least one category')
        if(!Array.isArray(category)) return sendResponse(res, 400, false, 'Category must be an array')
    }
    if(eventDate){
        if (!isValidEventDate(eventDate)) return sendResponse(res, 400, false, 'eventDate must be in the format YYYY-MM-DD')
    }

    try {
        let categories
        if(category){
            //check category and create if not exist
            categories = await Promise.all(category.map(async (cat) => {
                const categorySlug = cat.toLowerCase().replace(/\s/g, '-');
                const category = await EventCategoryModel.findOne({ slug: categorySlug });
                if (!category) {
                    // Create a slug from the category name also remove spaces and make it one word all lower case
    
                    const newCategory = new EventCategoryModel({ name: cat, slug: categorySlug });
                    await newCategory.save();
                    return newCategory._id;
                }
                return {_id: category._id.toString(), name: category.name};
            }));
        }

        let imageUrl = null
        if(image?.[0]){
            imageUrl = await uploadToCloudinary(image[0].buffer, 'event/images', 'image')
        }

        let authorImageUrl = null
        if(authorImage?.[0]){
            authorImageUrl = uploadToCloudinary(authorImage[0].buffer, 'author/images', 'image')
        }

        const getEvent = await EventModel.findOne({ eventId })
        if(!getEvent) return sendResponse(res, 404, false, 'Event not found')
        
        if(title) getEvent.title = title 
        if(abstract) getEvent.abstract = abstract 
        if(introduction) getEvent.introduction = introduction 
        if(content) getEvent.content = content
        if(conclusion) getEvent.conclusion = conclusion
        if(author) getEvent.author = author
        if(authorImage) getEvent.authorImage = authorImageUrl
        if(category) getEvent.category = categories
        if(image) getEvent.image = imageUrl
        if(eventDate) getEvent.eventDate = eventDate

        await getEvent.save()
        sendResponse(res, 201, true, 'Blog updated')
    } catch (error) {
        console.log('UNABLE TO UPDATE EVENT', error)
        sendResponse(res, 500, false, 'Unable to update event')
    }
}

export async function deleteEvent(req, res) {
    const { eventId } = req.body
    if(!eventId) return sendResponse(res, 400, false, 'Event Id is required')
    
    try {
        const getEvent = await EventModel.findOneAndDelete({ eventId })
        if(!getEvent) return sendResponse(res, 404, false, 'Event not found')
        
        sendResponse(res, 200, true, 'Event deleted successful')
    } catch (error) {
        console.log('UNABLE TO DELETE EVENT', error)
        sendResponse(res, 500, false, 'Unable to delete event')
    }
}

export async function getEvents(req, res) {
    const { limit = 10, page = 1, category, startDate, endDate, search, eventDate } = req.query;

    try {
        const numericLimit = Number(limit);
        const numericPage = Number(page);
        const skip = (numericPage - 1) * numericLimit;

        let query = {};

        if (category) {
            query.category = {
                $elemMatch: {
                    name: { $regex: category, $options: 'i' }
                }
            };
        }        

        if (search) {
            const orConditions = [
                { authorName: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
                { abstract: { $regex: search, $options: 'i' } },
                { eventId: { $regex: search, $options: 'i' } }
            ];
        
            // Check if the search string looks like a date in YYYY-MM-DD format
            const isDate = /^\d{4}-\d{2}-\d{2}$/.test(search);
            if (isDate) {
                const parsedDate = new Date(search);
                const nextDay = new Date(parsedDate);
                nextDay.setDate(nextDay.getDate() + 1);
        
                orConditions.push({
                    eventDate: {
                        $gte: parsedDate,
                        $lt: nextDay
                    }
                });
            }
        
            query.$or = orConditions;
        }
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const events = await EventModel.find(query)
            .skip(skip)
            .limit(numericLimit)
            .sort({ createdAt: -1 })
            .select('-introduction -content -conclusion -_id -__v');

        const total = await EventModel.countDocuments(query);

        sendResponse(res, 200, true, {
            data: events,
            total,
            page: numericPage,
            limit: numericLimit,
            totalPages: Math.ceil(total / numericLimit)
        }, 'Events fetched successfully');
    } catch (error) {
        console.log('UNABLE TO GET EVENTS', error);
        sendResponse(res, 500, false, 'Unable to get Events');
    }
}

export async function getEvent(req, res) {
    const { eventId } = req.body
    if(!eventId) return sendResponse(res, 400, false, 'Event Id is required')
    
    try {
        const getEvent = await EventModel.findOne({ eventId })
        if(!getEvent) return sendResponse(res, 404, false, 'Event not found')
        
        sendResponse(res, 200, true, getEvent, 'Event fetched successful')
    } catch (error) {
        console.log('UNABLE TO FETCH EVENT', error)
        sendResponse(res, 500, false, 'Unable to fetch event')
    }
}