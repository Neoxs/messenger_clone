const User = require('../models/user')
const Message = require('../models/message')

module.exports = (io) => {

    io.on('connection', (socket) => {
        console.log('new connection')
        //
        //console.log(socket.request.user)
        socket.on('join', async ({ contactId, roomId }) => {
      
          socket.join(roomId)

          const msg = await loadMessages(roomId)
          //console.log(msg)  
          socket.emit('message', msg)
          //socket.broadcast.to(roomId).emit('message', generateMessage('Admin', `${req.user.username} has joined!`))
      
        })
      
        socket.on('sendMessage', async (msg, callback) => {
            const user = socket.request._id
            generateMessage(msg.roomId, msg.contactId, msg.message, socket).then(message => {
                //console.log(message)
                const msgs = []
                msgs.push(message)
                io.to(msg.roomId).emit('message', msgs)
                callback()
            })
        })
      
        // socket.on('sendLocation', (coords, callsback) => {
        //     const user = getUser(socket.id)
      
        //     io.to(user.room).emit('shareLocation', generateLocationMessage(user.username, coords))
        //     callback()
        // })
      
        // socket.on('disconnect', () => {
        //     const user = removeUser(socket.id)
      
        //     if (user) {
        //         io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
        //         io.to(user.room).emit('roomData', {
        //             room: user.room,
        //             users: getUsersInRoom(user.room)
        //         })
        //     }
        // })
    })

}

//Helper functions
const generateMessage = async (roomId, contactId, text, socket) => {
    try {
        const username = socket.request.user.username     
        const msg = await new Message()
        msg.roomId = roomId
        msg.from = socket.request.user._id.toString()
        msg.to = contactId
        msg.text = text
        msg.createdAt = new Date().getTime()
        await msg.save()        
        return {
            username,
            text,
            createdAt: msg.createdAt
        }
    }catch(err){
        console.log(err.message)
        return null
    }
}

const loadMessages = async (roomId) => {
    try {
        oldMessages = await Message.find({roomId}).populate('from')
        const msg = await oldMessages.map((message) => {
            return {
                username: message.from.username,
                text: message.text,
                createdAt: message.createdAt
            }
        });
        return msg
    } catch(err) {
        console.log(err.message)
        
    }
}
