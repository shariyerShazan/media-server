import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
  },
  bio: {
    type: String,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    required : true
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  followings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  post : [{
    type: mongoose.Schema.Types.ObjectId ,
    ref : "Post" ,
  }],
  favouritePost : [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post"
  }]
},{timestamps : true});


export const User = mongoose.model("User" , userSchema)
