//require needed modules
const express = require('express')
const path = require('path')
const edge = require('express-edge')
const bodyParser = require("body-parser")
const session = require('express-session')
const flash = require("connect-flash");
const passport = require("passport");


const MongoDBStore = require('connect-mongodb-session')(session)

//Connecting to the database
require('./config/mongoose')

//MongoDBStore store object
const store =  new MongoDBStore({
  uri: 'mongodb://127.0.0.1:27017/chatwood',
  collection: 'sessions'
})

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

//Express session
app.use(
    session({
      secret: 'secret',
      resave: false,
      saveUninitialized: false,
      store: store // u will find store variable on config/mongoose
    })
)

// connect flash
app.use(flash());

//passport init
app.use(passport.initialize());
app.use(passport.session());

//require routes
const chatRoutes = require('./routes/chat')
const authRoutes = require('./routes/auth')

//Registering routes
app.use((req, res, next) => {
    console.log(req.isAuthenticated())
    next()
})
app.use(chatRoutes)
app.use(authRoutes)



//Set up port
const port = process.env.PORT || 3000


//listening to requests
app.listen(port, () => {
    console.log('Server is up on port ' + port)
})