import express from "express"
import { isAuthed } from "../middlewares/isAuthed.js"
import { getMessages, sendMessage } from "../controllers/message.controller.js"

const router = express.Router()

router.post("/send-message/:id" , isAuthed , sendMessage)
router.get("/get-message/:id" , isAuthed , getMessages)

export default router