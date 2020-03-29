io.on('connection', (socket) => {
    console.log('new connection')
  
    socket.on('join', ( options, callback ) => {
  
      socket.join(user.room)
  
      socket.emit('message', generateMessage('Admin' ,'welcome !'))
      socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
      
      io.to(user.room).emit('roomData', {
          room: user.room,
          users: getUsersInRoom(user.room)
      })
  
      callback()
    })
  
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
  
        const filter = new Filter()
  
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }
  
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })
  
    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
  
        io.to(user.room).emit('shareLocation', generateLocationMessage(user.username, coords))
        callback()
    })
  
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
  
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
  })