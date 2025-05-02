import mongoose from "mongoose";

const CommunitySchema = new mongoose.Schema({
    commuityId: {
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

const CommunityModel = mongoose.model('community', CommunitySchema)
export default CommunityModel