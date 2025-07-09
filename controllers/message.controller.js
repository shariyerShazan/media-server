import { Conversation } from "../models/conversation.model.js"
import { Message } from "../models/message.model.js"

export const sendMessage = async (req, res) => {
    try {
      const senderId = req.userId;
      const receiverId = req.params.id;
      const { message } = req.body;
  
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      });
  
      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, receiverId],
        });
      }
  
      const newMessage = await Message.create({
        senderId,
        receiverId,
        message,
      });
  
      conversation.messages.push(newMessage._id);
      await conversation.save();
  
      return res.status(201).json({
        success: true,
        message: newMessage,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Something went wrong while sending message.",
      });
    }
  };
  



export const getMessages = async (req, res) => {
  try {
    const senderId = req.userId;
    const receiverId = req.params.id;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    if (!conversation) {
      return res.status(200).json({
        messages: [],
        success: true,
      });
    }

    return res.status(200).json({
      messages: conversation.messages,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching messages.",
    });
  }
};
