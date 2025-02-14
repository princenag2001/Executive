import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    groupPic: {
        type: String,
        default: ""
    },
    members: {
        type: Array,
        default: []
    }
}, {timestamps: true, strict: false});

export default mongoose.model("Group", groupSchema);