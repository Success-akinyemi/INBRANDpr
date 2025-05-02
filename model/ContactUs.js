import mongoose from "mongoose";

const ContactUsSchema = new mongoose.Schema({
    messageId: {
        type: String
    },
    firstName: {
        type: String,
        required: [ true, 'First name is required' ]
    },
    lastName: {
        type: String,
        required: [ true, 'Last name is required' ]
    },
    email: {
        type: String,
        required: [ true, 'Email is required' ]
    },
    message: {
        type: String,
        required: [ true, 'Message is required' ]
    },
    replyMessage: {
        type: String
    },
    replied: {
        type: Boolean,
        default: false
    }
},
{ timestamps: true }
)

const ContactUsModel = mongoose.model('contactus', ContactUsSchema)
export default ContactUsModel