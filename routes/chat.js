const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const Room = require('../models/room')


//getting welcome "home" page and rendering the latest products on it
router.get('/', (req, res) => {
    res.render('chat')
})

router.post('/add-friend/:id', async (req, res) => {
    const id = req.params.id
    try {
        const user = await User.findById(req.user._id)
        const userFriend = await User.findById(id)
        const room = await new Room()
        room.clients = room.clients.concat([{userId: id}, {userId: req.user._id}])

        user.friends = user.friends.concat({userId: id, roomId: room._id})
        userFriend.friends = userFriend.friends.concat({userId: req.user._id, roomId: room._id})
        await room.save()
        await user.save()
        await userFriend.save()
        res.send(room)

    }catch(err) {
        console.log(err.message)
        res.status(400).send(err.message)
    }
})

router.get('/chat', async(req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('friends.userId')
        res.render('chat', {
            path: '/chat',
            pageTitle: 'chat',
            user: user,
            error: req.flash[0],
            contacts: user.friends,
            isAuthenticated: req.isAuthenticated()
        })
    }catch(err){
        console.log(err.message)
        res.status(400).send(err.message)
    }
})

router.get('/user/friends', async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('friends.userId')
        res.send(user.friends)
    }catch(err){
        res.status(400).send(err.message)
    }
})

module.exports = router