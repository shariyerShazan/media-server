import express from "express"
import { changePassword, editProfile, followAndUnfollow, getOthersUsers, getProfile, login, logout, register } from "../controllers/user.controller.js"
import { isAuthed } from "../middlewares/isAuthed.js"
import upload from "../middlewares/multer.js"

const router = express.Router()

// auth user
router.post("/register" , register)
router.post("/login" ,  login)
router.get("/logout" ,isAuthed ,  logout)

// get user
router.get("/get-profile/:id" , isAuthed, getProfile)
router.patch("/change-password" , isAuthed, changePassword)
router.patch("/edit-profile" , isAuthed , upload.single("profilePicture") , editProfile)
router.get("/other-users" , isAuthed , getOthersUsers)
router.patch("/follow/:id" , isAuthed , followAndUnfollow)

export default router;  