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
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female"],
  },
  followes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  following: [
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
