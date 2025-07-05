import dotenv from "dotenv"
dotenv.config()
import express from "express"
const app = express()
import cookieParser from "cookie-parser"
import cors from "cors"
import { connectDB } from "./utils/db.js"
import userRoutes from "./routes/user.route.js"
import postRoutes from "./routes/post.route.js"
import messageRoutes from "./routes/message.route.js"

// connect db
connectDB()

// middlewares
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors({
    origin: "http://localhost:5173/",
    credentials: true
}))
app.use(cookieParser())

// apis
app.get("/" , (req , res)=>{
    res.status(200).json({
        message : "Server home page running" ,
        success: true
    })
})
app.use("/api/users" , userRoutes)
app.use("/api/posts" , postRoutes)
app.use("/api/messages" , messageRoutes)


const PORT = process.env.PORT || 6001
app.listen(PORT , ()=>{
    console.log(`your server is runnig at http://localhost:${PORT}`) 
})