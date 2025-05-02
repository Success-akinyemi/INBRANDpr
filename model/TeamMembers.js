import mongoose from "mongoose";

const TeamMembersSchema = new mongoose.Schema({
    memberId: {
        type: String,
        required: [ true, 'Member Id is required' ],
        unique: [ true, 'Member Id must be unique' ]
    },
    name: {
        type: String
    },
    position: {
        type: String
    },
    bio: {
        type: String
    },
    image: {
        type: String
    }
},
{ timestamps: true }
)

const TeamMembersModel = mongoose.model('team-memebers', TeamMembersSchema)
export default TeamMembersModel