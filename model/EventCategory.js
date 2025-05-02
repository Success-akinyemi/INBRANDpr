import mongoose from "mongoose";

const EventCategorySchema = new mongoose.Schema({
    name: {
        type: String
    },
    slug: {
        type: String
    }
},
{ timestamps: true }
)

const EventCategoryModel = mongoose.model('event-category', EventCategorySchema)
export default EventCategoryModel