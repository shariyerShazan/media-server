import { User } from "../models/user.model.js" 
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getDataUri } from "../utils/dataUri.js"
import cloudinary from "../utils/cloudinary.js"

export const register = async (req , res)=>{
    try {
        const {fullName , email , password , gender} =  req.body;
        
        if(!fullName || !email || !password || !gender){
            return res.status(400).json({
                message : "Something is missing",
                success: false
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
              message: "Password must be at least 6 characters long",
              success: false,
            });
        }
        if (!/[a-zA-Z]/.test(password)) {
            return res.status(400).json({
              message: "Password must contain at least one letter",
              success: false,
            });
        }
        if (!/[0-9]/.test(password)) {
            return res.status(400).json({
              message: "Password must contain at least one number",
              success: false,
            });
        }
        const existUser = await User.findOne({email});
        if(existUser){
            return res.status(409).json({  
                message: "User already exists with this email",
                success: false
            });
        }
        const hashPassword = await bcrypt.hash(password , 10);
        const newUser = await User.create({
            fullName,
            email,
            password: hashPassword,
            gender
        });

        return res.status(201).json({
            message: "Account registered successfully",
            success: true
        });
    } catch (error) {
        console.error("Register error:", error.message);
        res.status(500).json({
          message: "Internal server error",
          success: false,
        });
    }
}



export const login = async (req , res)=>{
     try {
        const {email , password} = req.body
        if(!email || !password){
            return  res.status(401).json({
                message : "Something is missing",
                success: false
            })
        }
        const user = await User.findOne({ email })
        // .populate({
        //     path: "posts",
        //     populate: {
        //       path: "comments",
        //       populate: {
        //         path: "commentedBy",
        //         select: "fullName profilePicture"
        //       }
        //     }
        //   });          
        if(!user){
            return res.status(404).json({
                message: "User not exist with this email",
                success: false
            })
        }
        const comparePassword = await bcrypt.compare(password , user.password )
        if(!comparePassword){
            return res.status(404).json({
                message: "Password is incorrect",
                success: false
            })
        }
        const token = jwt.sign({userId : user._id} , process.env.SECRET_KEY , {expiresIn: "7d"})
        return res.status(200).cookie("token" , token , {maxAge: 7*24*60*60*1000 , httpOnly : true , sameSite: "strict"}).json({
            message : `Welcome back ${user.fullName}`,
            user ,
            success: true
        })
     } catch (error) {
        console.log(error)
     }
}

export const logout = async (req , res)=>{
    try {
        return res.status(200).cookie("token" , "" , {maxAge: 0}).json({
            message : "Logout successfully",
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}



export const getProfile = async (req , res)=>{
    try {
        const userId = req.params.id
        const user = await User.findById(userId).select("-password").populate({
            path: "posts",
            populate: {
              path: "comments",
              populate: {
                path: "commentedBy",
                select: "fullName profilePicture"
              }
            }
          })
          .populate({
            path : "followers" , select: "fullName , profilePicture"
          }).populate({
            path : "followings" , select: "fullName , profilePicture"
          })
          .populate({
            path: "favouritePost",
            populate: {
              path: "comments",
              populate: {
                path: "commentedBy",
                select: "fullName profilePicture"
              }
            }
          })
         
          
        if(!user){
            return res.status(404).json({
                message : "User not found",
                success: false
            })
        }
       return  res.status(200).json({
            user ,
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}


export const editProfile = async (req , res)=>{
    try {
        const userId = req.userId
        const user = await User.findById(userId)

        const {bio , gender , fullName} = req.body
        const profilePicture = req.file
        
        if(!user){
            return res.status(404).json({
                message : "User not found",
                success: false
            })
        }
        let cloudResponse
        if(profilePicture){
            const fileUri = getDataUri(profilePicture)
          cloudResponse = await cloudinary.uploader.upload(fileUri)
        }
        if(bio){
            user.bio = bio
        }
        if(gender){
            user.gender = gender
        }
        if(fullName){
            user.fullName = fullName
        }
        if(profilePicture){
            user.profilePicture = cloudResponse.secure_url 
        }
        await user.save()
        return res.status(200).json({
            message : "Profile updated successfully" ,
            success: true ,
            user 
        })
    } catch (error) {
        console.log(error)
    }
}

export const changePassword = async (req, res)=>{
    try {
        const userId = req.userId
        const user = await User.findById(userId)
        const {oldPassword , newPassword} = req.body
        if(!oldPassword || !newPassword){
            return res.status(400).json({
                message : "Something is missing",
                success: false
            })
        }
        const matchPassword = await bcrypt.compare( oldPassword , user.password )
        if(!matchPassword){
            return res.status(401).json({
                message : "Wrong old password" ,
                success: false
            })
        }
        if (newPassword.length < 6) {
            return res.status(400).json({
              message: "Password must be at least 6 characters long",
              success: false,
            });
          }
          if (!/[a-zA-Z]/.test(newPassword)) {
            return res.status(400).json({
              message: "Password must contain at least one letter",
              success: false,
            });
          }
          if (!/[0-9]/.test(newPassword)) {
            return res.status(400).json({
              message: "Password must contain at least one number",
              success: false,
            });
          }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword
            await user.save()
            return res.status(200).json({
                message : "Password change succefully",
                success: true
            })
    } catch (error) {
      console.log(error)  
    }
}

export const getOthersUsers = async (req, res) => {
    try {
      const userId = req.userId;
  
      const otherUsers = await User.find({ _id: { $ne: userId } });
  
      if (otherUsers.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No users found except current user.",
        });
      }
  
      return res.status(200).json({
        success: true,
        otherUsers,
      });
    } catch (error) {
      console.error("Error fetching other users:", error.message);
      return res.status(500).json({
        success: false,
        message: "Something went wrong while fetching users.",
      });
    }
  };
  

  export const followAndUnfollow = async (req, res) => {
    try {
      const userId = req.userId;
      const targetUserId = req.params.id;
  
      if (userId === targetUserId) {
        return res.status(400).json({
          message: "You can't follow yourself",
          success: false
        });
      }
  
      const user = await User.findById(userId);
      const targetUser = await User.findById(targetUserId);
  
      if (!user || !targetUser) {
        return res.status(400).json({
          message: "No user found",
          success: false
        });
      }
  
      const isAlreadyFollowed = user.followings.includes(targetUserId);
  
      if (isAlreadyFollowed) {
        // Unfollow logic
        user.followings.pull(targetUserId);
        targetUser.followers.pull(userId);
  
        await user.save();
        await targetUser.save();
  
        const updatedUser = await User.findById(userId); 
  
        return res.status(200).json({
          message: "User unfollowed successfully",
          success: true,
          updatedUser,              
          isFollow: false           
        });
      } else {
        // Follow logic
        user.followings.push(targetUserId);
        targetUser.followers.push(userId);
  
        await user.save();
        await targetUser.save();
  
        const updatedUser = await User.findById(userId);
  
        return res.status(200).json({
          message: "User followed successfully",
          success: true,
          updatedUser,
          isFollow: true            
        });
      }
  
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal server error",
        success: false
      });
    }
  };
  