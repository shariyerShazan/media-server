import jwt from "jsonwebtoken"

export const isAuthed = async (req , res , next)=>{
     try {
        const token = req.cookies.token 
        if(!token){
             return res.status(401).json({
                message : "unauthorized user",
                success: false
             })
        }
        const decoded = await jwt.verify(token , process.env.SECRET_KEY)
        if(!decoded){
            return res.status(401).json({
                message : "Invalid token",
                success: false
             })
        }
        req.userId = decoded.userId
        next()
     } catch (error) {
        console.log(error)
     }
}