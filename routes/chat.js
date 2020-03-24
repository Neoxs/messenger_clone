const express = require('express')
const router = new express.Router()


//getting welcome "home" page and rendering the latest products on it
router.get('/', (req, res) => {
    res.render('chat')
})

module.exports = router