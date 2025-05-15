import { sendResponse, uploadToCloudinary } from "../middlewares/utils.js"
import CommunityModel from "../model/Community.js";
import CommunityCategoryModel from "../model/CommunityCategory.js";


export async function newCommuntiy(req, res) {
    const { title, abstract, introduction, content, conclusion, author, category } = req.body
    const { image, authorImage } = req.file || {}
    if(!title) return sendResponse(res, 400, false, 'Blog Title is required')
    //if(!abstract) return sendResponse(res, 400, false, 'Blog Abstract is required')
    if(!content) return sendResponse(res, 400)
    if(!category) return sendResponse(res, 400, false, 'Category is required')
    if(category?.length < 1) return sendResponse(res, 400, false, 'Category needs at least one category')
    if(!Array.isArray(category)) return sendResponse(res, 400, false, 'Category must be an array')

    try {
        //check category and create if not exist
        const categories = await Promise.all(category.map(async (cat) => {
            const categorySlug = cat.toLowerCase().replace(/\s/g, '-');
            const category = await CommunityCategoryModel.findOne({ slug: categorySlug });
            if (!category) {
                // Create a slug from the category name also remove spaces and make it one word all lower case

                const newCategory = new CommunityCategoryModel({ name: cat, slug: categorySlug });
                await newCategory.save();
                return newCategory._id;
            }
            return {_id: category._id.toString(), name: category.name};
        }));

        let imageUrl = null
        if(image?.[0]){
            imageUrl = await uploadToCloudinary(image[0].buffer, 'community/images', 'image')
        }

        let authorImageUrl = null
        if(authorImage?.[0]){
            authorImageUrl = await uploadToCloudinary(authorImage[0].buffer, 'author/images', 'image')
        }

        const uniqueCode = await generateUniqueCode(9)
        const commuityId = `INpr${uniqueCode}CM`

        const newCommunity = await CommunityModel.create({
            commuityId,
            title,
            abstract,
            introduction,
            content,
            conclusion,
            author,
            authorImage: authorImageUrl,
            category: categories,
            image: imageUrl
        })

        sendResponse(res, 201, true, 'Community created')
    } catch (error) {
        console.log('UNABLE TO CREATE COMMUNITY', error)
        sendResponse(res, 500, false, 'Unable to create community')
    }
}

export async function updateCommunity(req, res) {
    const { commuityId, title, abstract, introduction, content, conclusion, author, category } = req.body
    const { image, authorImage } = req.file || {}
    if(!commuityId) return sendResponse(res, 400, false, 'Communtiy Id is required')
    if(category) {
        if(category?.length < 1) return sendResponse(res, 400, false, 'Category needs at least one category')
        if(!Array.isArray(category)) return sendResponse(res, 400, false, 'Category must be an array')
    }

    try {
        let categories
        if(category){
            //check category and create if not exist
            categories = await Promise.all(category.map(async (cat) => {
                const categorySlug = cat.toLowerCase().replace(/\s/g, '-');
                const category = await CommunityCategoryModel.findOne({ slug: categorySlug });
                if (!category) {
                    // Create a slug from the category name also remove spaces and make it one word all lower case
    
                    const newCategory = new CommunityCategoryModel({ name: cat, slug: categorySlug });
                    await newCategory.save();
                    return newCategory._id;
                }
                return {_id: category._id.toString(), name: category.name};
            }));
        }

        let imageUrl = null
        if(image?.[0]){
            imageUrl = await uploadToCloudinary(image[0].buffer, 'community/images', 'image')
        }

        let authorImageUrl = null
        if(authorImage?.[0]){
            authorImageUrl = await uploadToCloudinary(authorImage[0].buffer, 'author/images', 'image')
        }

        const getCommunity = await CommunityModel.findOne({ commuityId })
        if(!getCommunity) return sendResponse(res, 404, false, 'Community not found')
        
        if(title) getCommunity.title = title 
        if(abstract) getCommunity.abstract = abstract 
        if(introduction) getCommunity.introduction = introduction 
        if(content) getCommunity.content = content
        if(conclusion) getCommunity.conclusion = conclusion
        if(author) getCommunity.author = author
        if(authorImage) getCommunity.authorImage = authorImageUrl
        if(category) getCommunity.category = categories
        if(image) getCommunity.image = imageUrl

        await getCommunity.save()
        sendResponse(res, 201, true, 'Community updated')
    } catch (error) {
        console.log('UNABLE TO UPDATE COMMUNUNITY', error)
        sendResponse(res, 500, false, 'Unable to update community')
    }
}

export async function deleteCommunity(req, res) {
    const { commuityId } = req.body
    if(!commuityId) return sendResponse(res, 400, false, 'Blog Id is required')
    
    try {
        const getCommunity = await CommunityModel.findOneAndDelete({ commuityId })
        if(!getCommunity) return sendResponse(res, 404, false, 'Community not found')
        
        sendResponse(res, 200, true, 'Community deleted successful')
    } catch (error) {
        console.log('UNABLE TO DELETE COMMUNITY', error)
        sendResponse(res, 500, false, 'Unable to delete community')
    }
}

export async function getCommunities(req, res) {
    const { limit = 10, page = 1, category, startDate, endDate, search } = req.query;

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
            query.$or = [
                { authorName: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
                { abstract: { $regex: search, $options: 'i' } },
                { commuityId: { $regex: search, $options: 'i' } }
            ];
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const blogs = await CommunityModel.find(query)
            .skip(skip)
            .limit(numericLimit)
            .sort({ createdAt: -1 })
            .select('-introduction -content -conclusion -_id -__v');

        const total = await CommunityModel.countDocuments(query);

        sendResponse(res, 200, true, {
            data: blogs,
            total,
            page: numericPage,
            limit: numericLimit,
            totalPages: Math.ceil(total / numericLimit)
        }, 'Communities fetched successfully');
    } catch (error) {
        console.log('UNABLE TO GET COMMUNITIES', error);
        sendResponse(res, 500, false, 'Unable to get communities');
    }
}

export async function getCommunity(req, res) {
    const { commuityId } = req.body
    if(!commuityId) return sendResponse(res, 400, false, 'Community Id is required')
    
    try {
        const getCommunity = await CommunityModel.findOne({ commuityId })
        if(!getCommunity) return sendResponse(res, 404, false, 'Community not found')
        
        sendResponse(res, 200, true, getCommunity, 'Community fetched successful')
    } catch (error) {
        console.log('UNABLE TO FETCH COMMUNITY', error)
        sendResponse(res, 500, false, 'Unable to fetch Community')
    }
}