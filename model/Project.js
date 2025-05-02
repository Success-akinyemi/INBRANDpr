import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
    projectId: {
        type: String,
        required: [ true, 'Project Id is required' ],
        unique: [ true, 'Project Id must be unique']
    },
    title: {
        type: String
    },
    description :{
        type: String
    },
    link: {
        type: String
    },
    image: {
        type: String
    }
}, 
{ timestamps: true }
)

const ProjectModel = mongoose.model('project', ProjectSchema)
export default ProjectModel