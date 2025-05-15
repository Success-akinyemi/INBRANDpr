import { sendResponse } from "../middlewares/utils.js"
import BlogModel from "../model/Blog.js";
import BlogCategoryModel from "../model/BlogCategory.js";


export async function newBlog(req, res) {
    const { title, abstract, introduction, content, conclusion, author, category } = req.body
    const { image, authorImage } = req.file || {}
    if(!title) return sendResponse(res, 400, false, 'Blog Title is required')
    if(!abstract) return sendResponse(res, 400, false, 'Blog Abstract is required')
    if(!content) return sendResponse(res, 400, false, 'Blog Content is required')
    if(!category) return sendResponse(res, 400, false, 'Category is required')
    if(category?.length < 1) return sendResponse(res, 400, false, 'Category needs at least one category')
    if(!Array.isArray(category)) return sendResponse(res, 400, false, 'Category must be an array')

    try {
        //check category and create if not exist
        const categories = await Promise.all(category.map(async (cat) => {
            const categorySlug = cat.toLowerCase().replace(/\s/g, '-');
            const category = await BlogCategoryModel.findOne({ slug: categorySlug });
            if (!category) {
                // Create a slug from the category name also remove spaces and make it one word all lower case

                const newCategory = new BlogCategoryModel({ name: cat, slug: categorySlug });
                await newCategory.save();
                return newCategory._id;
            }
            return {_id: category._id.toString(), name: category.name};
        }));

        let imageUrl = null
        if(image?.[0]){
            imageUrl = await uploadToCloudinary(image[0].buffer, 'blog/images', 'image')
        }

        let authorImageUrl = null
        if(authorImage?.[0]){
            authorImageUrl = await uploadToCloudinary(authorImage[0].buffer, 'author/images', 'image')
        }

        const uniqueCode = await generateUniqueCode(9)
        const blogId = `INpr${uniqueCode}BL`

        const newBlog = await BlogModel.create({
            blogId,
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

        sendResponse(res, 201, true, 'Blog created')
    } catch (error) {
        console.log('UNABLE TO CREATE BLOG', error)
        sendResponse(res, 500, false, 'Unable to create blog')
    }
}

export async function updateBlog(req, res) {
    const { blogId, title, abstract, introduction, content, conclusion, author, category } = req.body
    const { image, authorImage } = req.file || {}
    if(!blogId) return sendResponse(res, 400, false, 'Blog Id is required')
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
                const category = await BlogCategoryModel.findOne({ slug: categorySlug });
                if (!category) {
                    // Create a slug from the category name also remove spaces and make it one word all lower case
    
                    const newCategory = new BlogCategoryModel({ name: cat, slug: categorySlug });
                    await newCategory.save();
                    return newCategory._id;
                }
                return {_id: category._id.toString(), name: category.name};
            }));
        }

        let imageUrl = null
        if(image?.[0]){
            imageUrl = await uploadToCloudinary(image[0].buffer, 'blog/images', 'image')
        }

        let authorImageUrl = null
        if(authorImage?.[0]){
            authorImageUrl = await uploadToCloudinary(authorImage[0].buffer, 'author/images', 'image')
        }

        const getBlog = await BlogModel.findOne({ blogId })
        if(!getBlog) return sendResponse(res, 404, false, 'Blog not found')
        
        if(title) getBlog.title = title 
        if(abstract) getBlog.abstract = abstract 
        if(introduction) getBlog.introduction = introduction 
        if(content) getBlog.content = content
        if(conclusion) getBlog.conclusion = conclusion
        if(author) getBlog.author = author
        if(authorImage) getBlog.authorImage = authorImageUrl
        if(category) getBlog.category = categories
        if(image) getBlog.image = imageUrl

        await getBlog.save()
        sendResponse(res, 201, true, 'Blog updated')
    } catch (error) {
        console.log('UNABLE TO UPDATE BLOG', error)
        sendResponse(res, 500, false, 'Unable to update blog')
    }
}

export async function deleteBlog(req, res) {
    const { blogId } = req.body
    if(!blogId) return sendResponse(res, 400, false, 'Blog Id is required')
    
    try {
        const getBlog = await BlogModel.findOneAndDelete({ blogId })
        if(!getBlog) return sendResponse(res, 404, false, 'Blog not found')
        
        sendResponse(res, 200, true, 'Blog deleted successful')
    } catch (error) {
        console.log('UNABLE TO DELETE BLOG', error)
        sendResponse(res, 500, false, 'Unable to delete blog')
    }
}

export async function getBlogs(req, res) {
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
                { blogId: { $regex: search, $options: 'i' } }
            ];
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const blogs = await BlogModel.find(query)
            .skip(skip)
            .limit(numericLimit)
            .sort({ createdAt: -1 })
            .select('-introduction -content -conclusion -_id -__v');

        const total = await BlogModel.countDocuments(query);

        sendResponse(res, 200, true, {
            data: blogs,
            total,
            page: numericPage,
            limit: numericLimit,
            totalPages: Math.ceil(total / numericLimit)
        }, 'Blogs fetched successfully');
    } catch (error) {
        console.log('UNABLE TO GET BLOGS', error);
        sendResponse(res, 500, false, 'Unable to get blogs');
    }
}

export async function getBlog(req, res) {
    const { blogId } = req.body
    if(!blogId) return sendResponse(res, 400, false, 'Blog Id is required')
    
    try {
        const getBlog = await BlogModel.findOne({ blogId })
        if(!getBlog) return sendResponse(res, 404, false, 'Blog not found')
        
        sendResponse(res, 200, true, getBlog, 'Blog fetched successful')
    } catch (error) {
        console.log('UNABLE TO FETCH BLOG', error)
        sendResponse(res, 500, false, 'Unable to fetch blog')
    }
}