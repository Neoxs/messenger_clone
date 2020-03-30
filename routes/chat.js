const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const Room = require('../models/room')
const Message = require('../models/message')

//middlewares
const isAuth = require('../middlewares/isAuth')
const isnAuth = require('../middlewares/isnAuth')


//getting welcome "home" page and rendering the latest products on it
router.get('/', (req, res) => {
    res.redirect('/chat')
})

router.post('/add-friend', isAuth, async (req, res) => {
    //const id = req.params.id
    const email = req.body.email
    const text = req.body.message
    try {
        const friend = await User.findOne({email})
        //console.log(friend)
        const user = await User.findById(req.user._id)
        let friendExist
        if (friend) friendExist = await User.findOne({ $and: [ { _id: req.user._id }, { friends: { $elemMatch: { userId: friend._id } } } ] })
        //console.log(friendExist)
        if(!friend){
            console.log("Sorry this contact doesn't exists !")
            res.send({ warning: "Sorry this contact doesn't exists !" })
        }else if(friend.email === user.email) {
            //req.flash('warning', "You can't add yourself" )
            console.log("You can't add yourself !")
            res.send({ warning: "You can't add yourself !" })
        } else if(friendExist) {
            console.log("This person is already on ur friends list")
            res.send({ warning: "This person is already on ur friends list" })
        } else {
            //console.log(user)
            //const userFriend = await User.findById(id)
            const room = await new Room()
            room.clients = room.clients.concat([{userId: friend._id}, {userId: req.user._id}])
            //console.log(room)
            user.friends = user.friends.concat({userId: friend._id, roomId: room._id})
            //console.log(user.friends)
            //console.log(friend.friends)
            friend.friends = friend.friends.concat({userId: req.user._id, roomId: room._id})
            await room.save()
            await user.save()
            await friend.save()
            const msg = await new Message()
            msg.roomId = room._id
            msg.from = req.user._id
            msg.to = friend._id
            msg.text = text
            msg.createdAt = new Date().getTime()
            await msg.save()  
            res.send({ success: "Congrats your friends request was sent !" })
        }

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
            isAuthenticated: req.isAuthenticated(),
            warning: req.flash('warning')[0]
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