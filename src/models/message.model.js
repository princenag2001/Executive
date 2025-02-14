import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reciever: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    text: {
        type: String,
    },
    image: {
        type: String,
    },
    type: {
        type: String,
        required: false
    },
}, {timestamps: true, strict: false});

export default mongoose.model("Message", messageSchema);