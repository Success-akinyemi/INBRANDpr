import mongoose from 'mongoose'

const UniqueIdSchema = new mongoose.Schema({
    uniqueId: {
        type: String
    }
},
{ timestamps: true }
)

const UniqueIdModel = mongoose.model('uniqueId', UniqueIdSchema)
export default UniqueIdModel