import { Conversation } from "../models/conversation.model.js"
import { Message } from "../models/message.model.js"

export const sendMessage = async (req, res)=>{
    try {
        const senderId = req.userId 
        const receiverId = req.params.id 
        const {message} = req.body
        let conversation = await Conversation.findOne({participants: {$all:[senderId, receiverId]}})
        if(!conversation){
            conversation = await Conversation.create({
                participants: [senderId , receiverId]
            })
        }
        const newMessage = await Message.create({
            senderId ,
            receiverId ,
            message
        })
        if(newMessage){
            conversation.messages.push(newMessage._id)
        }
        await conversation.save()
        await newMessage.save()

        // socket io
    } catch (error) {
        console.log(error)
    }
}



export const getMessages = async (req , res)=>{
    try {
        const senderId = req.userId 
        const receiverId = req.params.id 
        let conversation = await Conversation.findOne({participants: {$all:[senderId, receiverId]}})
        if(!conversation){
          return res.status(200).json({
            messages : [],
            success: true
          })
        }
        return res.status(200).json({
            messages : conversation.messages,
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}