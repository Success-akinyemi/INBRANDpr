import mongoose from "mongoose";

const BlogCategorySchema = new mongoose.Schema({
    name: {
        type: String
    },
    slug: {
        type: String
    }
},
{ timestamps: true }
)

const BlogCategoryModel = mongoose.model('blog-category', BlogCategorySchema)
export default BlogCategoryModel