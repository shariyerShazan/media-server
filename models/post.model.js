import mongoose from "mongoose"


const postSchema = new mongoose.Schema({
    caption: {
        type: String ,
        default: ""
    },
    postImage: {
        type: String ,
        required : true
    },
    postedBy: {
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    likes: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    comments: [{
        type : String,
        ref: "Comment",
    }]
}, {timestamps: true})

export const Post = mongoose.model("Post" , postSchema)