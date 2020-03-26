const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({ 
    clients: [{
        userId: {
            type: String,
            required: true,
            ref: 'User'
        }
    }],
    messages: [{
        message: {
            type: String,
            required: true
        },
        owner: {
            type: String,
            required: true,
            ref: 'User'
        }
    }]
})


const Room = mongoose.model('Room', roomSchema)

module.exports = Room