import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema({
    blogId: {
        type: String,
        required: [ true, 'Blog Id is required' ],
        unique: [ true, 'Blog Id must be unique' ]
    },
    title: {
        type: String
    },
    abstract: {
        type: String
    },
    introduction: {
        type: String
    },
    content: {
        type: String
    },
    conclusion: {
        type: String
    },
    author: {
        type: String
    },
    authorImage: {
        type: String
    },
    category: {
        type: Array
    },
    image: {
        type: String
    }
},
{ timestamps: true }
)

const BlogModel = mongoose.model('blog', BlogSchema)
export default BlogModel