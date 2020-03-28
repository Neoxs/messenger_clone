const User = require('../models/user')

exports.getSignup = (req, res) => {
    res.render("auth/register", {
        pageTitle: "register",
        path: '/register',
        isAuthenticated: req.isAuthenticated
    })
}

exports.postSignup = async(req, res) => {
    const { username, email, password, confirmPassword } = req.body
    const isValid = (password === confirmPassword)
 
    if(!isValid) {
        req.flash('registerMessage', 'Password does not match')
        res.redirect('/register')
    } else {
       delete req.body.confirmPassword
       const user = new User(req.body)
 
       try {
             await user.save()
             req.flash('loginMessage', 'Your account has been seccessfuly created !')
             res.redirect('/login')
       } catch (err) {
             console.log(err)
             req.flash('registerMessage', 'Something went wrong !')
             res.redirect('/register')
       }
    }
 
}

exports.getLogin = (req, res) => {
    res.render("auth/login", {
       path: '/login',
       pageTitle: 'Login',
       isAuthenticated: req.session.isAuthenticated,
       user: req.session.user
    })
}

exports.postLogin = async (req, res) => {
    try {
       const user = await User.findByCredentials(req.body.email, req.body.password)
       req.session.isAuthenticated = true
       req.session.user = user
       req.session.user.password = ""
       await req.session.save()
       res.redirect('/')
 
    }catch(e){
       res.render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          isAuthenticated: req.session.isAuthenticated,
          user: req.session,
          error: e.message
       })
    }
}

exports.postLogout = async(req, res) => {
    try {
        await req.session.destroy()
        res.redirect('/login')
    }catch(err) {
        console.log(err.message)
        res.redirect('/')
    }
}