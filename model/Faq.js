import mongoose from "mongoose";

const FaqSchema = new mongoose.Schema({
    faqId: {
        type: String,
        required: [ true, 'Faq Id is required' ],
        unique: [ true, 'Faq must be unique' ]
    },
    question: {
        type: String,
        required: [ true, 'Question is required' ]
    },
    answer: {
        type: String,
        required: [ true, 'Answer is required' ]
    }
},
{ timestamps: true }
)

const FaqModel = mongoose.model('faq', FaqSchema)
export default FaqModel 