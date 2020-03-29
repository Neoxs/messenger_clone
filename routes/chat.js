const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const Room = require('../models/room')

//middlewares
const isAuth = require('../middlewares/isAuth')
const isnAuth = require('../middlewares/isnAuth')


//getting welcome "home" page and rendering the latest products on it
router.get('/', (req, res) => {
    res.redirect('/chat')
})

router.get('/add-friend/:id', isAuth, async (req, res) => {
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

router.get('/chat', isAuth, async(req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('friends.userId')
        res.render('chat', {
            path: '/chat',
            pageTitle: 'chat',
            user: user,
            contacts: user.friends,
            isAuthenticated: req.isAuthenticated()
        })
    }catch(err){
        console.log(err.message)
        res.status(400).send(err.message)
    }
})

router.get('/user/friends', isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('friends.userId')
        res.send(user.friends)
    }catch(err){
        res.status(400).send(err.message)
    }
})

router.post('/search', isAuth, async (req, res) => {
    
    try {
        if(req.body.email){
            const users = await User.find({email: req.body.email})
            res.send(users)
        } else{
            const users = await User.find({username: { $regex: `${req.body.username}\w*`, $options: 'i' } })            
            res.send(users)
        }
        
    } catch (err) {
        console.log(err.message)
        res.status(500).send(err.message)
    }
})

module.exports = router