const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://chatwood:123456789x@chatwood-7dqub.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})