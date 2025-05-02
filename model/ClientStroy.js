import mongoose from "mongoose";

const ClientStorySchema = new mongoose.Schema({
    storyId: {
        type: String,
        required: [ true, 'Client stroy id is required' ],
        unique: [ true, 'Client stroty id must be unique' ]
    },
    name: {
        type: String,
    },
    story: {
        type: String
    },
    role: {
        type: String
    },
    ratings: {
        type: String
    },
    image: {
        type: String
    }
},
{ timestamps: true }
)

const ClientStoryModel = mongoose.model('client-stories', ClientStorySchema)
export default ClientStoryModel