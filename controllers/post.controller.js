import sharp from "sharp"
import cloudinary from "../utils/cloudinary.js"
import { Post } from "../models/post.model.js"
import { User } from "../models/user.model.js"
import { Comment } from "../models/comment.model.js"

export const addNewPost = async (req , res)=>{
    try {
        const {caption }= req.body
        const postImage = req.file
        const userId = req.userId

        if (caption && caption.length > 300) {
            return res.status(400).json({
              message: "Caption must be under 300 characters",
              success: false,
            });
          }          
        if(!postImage){ 
            return res.status(400).json({
        message : "Image is required",
        success: false
            })
        }
        const resizeImg = await sharp(postImage.buffer).resize({width: 800 , height: 800 , fit: "inside"}).toFormat("jpeg" , {quality: 100}).toBuffer()
     const fileUri = `data:image/jpeg;base64,${resizeImg.toString("base64")}`
     const cloudinaryRes = await cloudinary.uploader.upload(fileUri)
     const post = await Post.create({
        caption ,
        postImage :  cloudinaryRes.secure_url,
        postedBy : userId
     })
     const user = await User.findById(userId)
     if(user && post){
        user.posts.push(post._id)
        await user.save()
     }
     await post.populate({path: "postedBy" , select: "-password"})
     return res.status(200).json({
        message : "New Post added",
        success: true
     })
    } catch (error) {
        console.log(error)
    }
}




export const getAllPosts = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
  
      const posts = await Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "postedBy",
          select: "fullName profilePicture email"
        })
        .populate({
          path: "comments",
          options: { sort: { createdAt: -1 } },
          populate: {
            path: "commentedBy",
            select: "fullName profilePicture email"
          }
        });
      const total = await Post.countDocuments();
  
      res.status(200).json({
        success: true,
        message: "All Posts",
        posts,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({
        success: false,
        message: "Server Error"
      });
    }
  };
  


export const getUserPosts = async (req , res)=>{
    try {
        const userParamsId = req.params.id
        const posts = await Post.find({postedBy:userParamsId}).sort({createdAt: -1}).populate({path: "postedBy" , select: "fullName profilePicture"}).populate({
            path: "comments" , sort:{createdAt: -1}, populate: {
                path: "commentedBy" ,
                select: "fullName profilePicture"
            }
        })
        return res.status(200).json({
            message : "All post" ,
            posts ,
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}


export const likeUnlike = async (req, res)=>{
    try {
        const userId = req.userId
        const tragetPostId= req.params.postId
        const user = await User.findById(userId)
        const targetPost = await Post.findById(tragetPostId)
        if(!user || !targetPost){
            return res.status(400).json({
                message: "Post needed" ,
                success: false
            })
        }
        const alreadyLiked = targetPost.likes.includes(userId)
        if(alreadyLiked){
            targetPost.likes.pull(userId)
            await targetPost.save()
        }else{
            targetPost.likes.push(userId)
            await targetPost.save()
        }
        return res.status(200).json({
            message: alreadyLiked ? "Post unliked" : "Post liked",
            success: true,
            likesCount: targetPost.likes.length,
            isLiked: !alreadyLiked
          });
          

    } catch (error) {
        console.log(error)
    }
}




export const addComment = async (req, res)=>{
 try {
    const userId = req.userId 
    const postId = req.params.postId
    const {text} = req.body 
    if(!text){
        return res.status(400).json({
            message : "Need text to comment" ,
            success : false
        })
    }
    const post = await Post.findById(postId)
    if(!post){
        return res.status(400).json({
            message: "Post Not Found",
            succes: false
        })
    }
    const comment =  await Comment.create({
        text ,
        commentedBy : userId,
        post : postId
    }) 
    if(comment){
         post.comments.push(comment._id)
        await post.save()
    }
    return res.status(200).json({
        message: "Commented succefully" ,
        comment ,
        success: true
    })

 } catch (error) {
    console.log(error)
 }
}


export const getCommentByPost = async (req , res)=>{
    try {
        const postId = req.params.postId
        const post = await Post.findById(postId)
        const comments = await Comment.find({post: postId}).populate({
            path: "commentedBy" , select: "fullName profilePicture" 
        }).populate("post")
         if(!comments){
            return res.status(404).json({ 
                message : "No comments found", 
                success: false
            })
         }
         return res.status(200).json({
            message: "comments here",
            comments
         })
    } catch (error) {
        console.log(error)
    }
}



export const deletePost = async (req , res)=>{
    try {
        const postId = req.params.postId
        const userId = req.userId
        const user = await User.findById(userId)
        const post = await Post.findById(postId)
        if(!post){
            return res.status(400).json({
                message: "Post not found",
                success : false
            })
        }
        const ableToDelete = String(post.postedBy) === String(userId);
        if(!ableToDelete){
            return res.status(400).json({
                message: "You can delete only your post",
                success : false
            })
        }
            await Post.findByIdAndDelete(postId)
            user.posts.pull(postId)
            await user.save()
            await Comment.deleteMany({post: postId})
            return res.status(200).json({
                message : "Post deleted successfully" ,
                success: true
            })
         
    } catch (error) {
        console.log(error)
    }
}



export const addFavouritePost = async (req, res)=>{
    try {
        const postId = req.params.postId
        const post = await Post.findById(postId)
        if(!post){
            return res.status(404).json({
                message : "Post not found",
                success: false
            })
        }
        const userId = req.userId
        const user = await User.findById(userId)
        const alreadyFavourite = user.favouritePost.includes(postId)
         if(alreadyFavourite){
          user.favouritePost.pull(postId)
         }else{
             user.favouritePost.push(postId)
         }
         await user.save()
       return res.status(200).json({
        message : alreadyFavourite? "Removed from favourite list" : "Added to favourite list" ,
        success: true
       })
    } catch (error) {
        console.log(error)
    }
}


export const getFavouritePost = async (req, res) => {
    try {
      const userId = req.userId;
  
      const user = await User.findById(userId).populate({
        path: "favouritePost",
        populate: {
          path: "postedBy",
          select: "fullName profilePicture"
        }
      });
  
      return res.status(200).json({
        message: "Favourite posts fetched successfully",
        success: true,
        favouritePosts: user.favouritePost
      });
  
    } catch (error) {
      console.log(error);
    }
  };
  