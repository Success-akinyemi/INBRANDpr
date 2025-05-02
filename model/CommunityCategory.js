import mongoose from "mongoose";

const CommunityCategorySchema = new mongoose.Schema({
    name: {
        type: String
    },
    slug: {
        type: String
    }
},
{ timestamps: true }
)

const CommunityCategoryModel = mongoose.model('community-category', CommunityCategorySchema)
export default CommunityCategoryModel