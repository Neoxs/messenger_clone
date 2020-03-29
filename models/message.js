const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({ 
    roomId: {
        type: String,
        required: true,
        ref: 'Room'
    },
    from: {
        type: String,
        required: true,
        ref: 'User'
    },
    to: {
        type: String,
        required: true,
        ref: 'User'
    },
    text: {
        type: String,
        required: true
    }
})


const Message = mongoose.model('Message', mesageSchema)

module.exports = Message