//require needed modules
const express = require('express')
const path = require('path')
const edge = require('express-edge')
const bodyParser = require("body-parser")
const session = require('express-session')


//create the express app
const app = express()

//Defining paths for Express
const publicDirectoryPath = path.join(__dirname, './public')
const viewsPath = path.join(__dirname, './views')

//Set up public files directory
app.use(express.static(publicDirectoryPath))

//Set up edge engine and views directory
app.set('view engine', 'edge-express')
app.use(edge.engine)
app.set('views', viewsPath)

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())


//require routes
const chatRoute = require('./routes/chat')

//Registering routes
app.use(chatRoute)



//Set up port
const port = process.env.PORT || 3000


//listening to requests
app.listen(port, () => {
    console.log('Server is up on port ' + port)
})