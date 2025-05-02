import mongoose from 'mongoose'

const ServicesSchema = new mongoose.Schema({
    image: {
        type: String
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    ctaLink: {
        type: String
    },
    serviceId: {
        type: String
    }
},
{ timestamps: true }
)

const ServicesModel = mongoose.model('services', ServicesSchema)
export default ServicesModel