import express from "express"
import { isAuthed } from "../middlewares/isAuthed.js"
import { addComment, addFavouritePost, addNewPost, deletePost, getAllPosts, getCommentByPost, getFavouritePost, getUserPosts, likeUnlike } from "../controllers/post.controller.js"
import upload from "../middlewares/multer.js"

const router = express.Router()

router.post("/new-post" , isAuthed , upload.single("postImage") ,  addNewPost)
router.get("/get-allpost" , isAuthed , getAllPosts)
router.get("/get-userpost/:id" , isAuthed , getUserPosts)
router.post("/ike-unlike/:postId" , isAuthed , likeUnlike)
router.post("/add-comment/:postId" , isAuthed , addComment)
router.get("/get-post-comment/:postId" , isAuthed , getCommentByPost)
router.delete("/delete-post/:postId" , isAuthed , deletePost)
router.post("/add-favourite/:postId" , isAuthed,addFavouritePost )
router.get("/get-favourite" , isAuthed , getFavouritePost)

export default router