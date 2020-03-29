//require needed modules
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const path = require('path')
const edge = require('express-edge')
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser')
const session = require('express-session')
const flash = require("connect-flash");
const passport = require("passport");
passportSocketIo = require("passport.socketio");


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
const server = http.createServer(app)
const io = socketio(server)

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
// parse the cookie
app.use(cookieParser())

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

//for testing
//With Socket.io >= 1.0
io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,       // the same middleware you registrer in express
  key:          'connect.sid',       // the name of the cookie where express/connect stores its session_id
  secret:       'secret',    // the session_secret to parse the cookie
  store:        store,        // we NEED to use a sessionstore. no memorystore please
  success:      onAuthorizeSuccess,  // *optional* callback on success - read more below
  fail:         onAuthorizeFail,     // *optional* callback on fail/error - read more below
}));

function onAuthorizeSuccess(data, accept){
  console.log('successful connection to socket.io');

  // The accept-callback still allows us to decide whether to
  // accept the connection or not.
  accept()
}

function onAuthorizeFail(data, message, error, accept){
  if(error)
    throw new Error(message);
  console.log('failed connection to socket.io:', message);

  // We use this callback to log all of our failed connections.


  // OR

  // If you use socket.io@1.X the callback looks different
  // If you don't want to accept the connection
  if(error)
    accept(new Error(message));
  // this error will be sent to the user as a special error-package
  // see: http://socket.io/docs/client-api/#socket > error-object
}
require('./config/socket')(io)

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
server.listen(port, () => {
    console.log('Server is up on port ' + port)
})