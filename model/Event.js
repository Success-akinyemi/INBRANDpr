import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
    eventId: {
        type: String,
        required: [ true, 'Event Id is required' ],
        unique: [ true, 'Event Id must be unique' ]
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
    },
    eventDate: {
        type: Date,
        required: [ true, 'Event Date is required' ]
    }
},
{ timestamps: true }
)

const EventModel = mongoose.model('event', EventSchema)
export default EventModel