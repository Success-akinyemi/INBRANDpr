import mongoose from "mongoose";

const SubscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [ true, 'Email address is required']
    }
},
{ timestamps: true }
)

const SubscriberModel = mongoose.model('subscribers', SubscriberSchema)
export default SubscriberModel