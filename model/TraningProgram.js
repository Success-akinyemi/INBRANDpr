import mongoose from "mongoose";

const TrainingProgramSchema = new mongoose.Schema({
    instructor: {
        type: String
    },
    title: {
        type: String
    },
    date: {
        type: String
    },
    duration: {
        type: String
    },
    tag: {
        type: Array
    },
    description: {
        type: String
    },
    trainingId: {
        type: String,
        required: [ true, 'Training Id is required'],
        unique: [ true, 'Traning Id must be unique']
    },
    image: {
        type: String
    }
},
{ timestamps: true }
)

const TrainingProgramModel = mongoose.model('training-program', TrainingProgramSchema)
export default TrainingProgramModel