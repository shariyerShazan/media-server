import express from "express"
import { changePassword, editProfile, followAndUnfollow, getOthersUsers, getProfile, login, logout, register } from "../controllers/user.controller.js"
import { isAutthed } from "../middlewares/isAuthed.js"
import upload from "../middlewares/multer.js"

const router = express.Router()

// auth user
router.post("/register" ,  register)
router.post("/login" ,  login)
router.get("/logout" ,isAutthed ,  logout)

// get user
router.get("/get-profile/:id" , isAutthed, getProfile)
router.get("/change-password" , isAutthed, changePassword)
router.patch("/edit-profile" , isAutthed , upload.single("profilePict") , editProfile)
router.get("/other-users" , isAutthed , getOthersUsers)
router.patch("/follow/:id" , isAutthed , followAndUnfollow)

export default router; 