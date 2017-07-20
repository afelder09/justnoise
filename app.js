// All our requires/dependencies
const express = require('express')
const bodyParser = require('body-parser')
const hbs = require('express-handlebars')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const methodOverride = require('method-override')
const session = require('express-session')
const passport = require('passport')
const http = require('http')
const SpotifyStrategy = require('passport-spotify').Strategy
const request = require('request');

// Connect  to our Mongo database, using Mongoose and include our models
mongoose.connect('mongodb://admin:admin@ds141960.mlab.com:41960/justnoise')

// Require our models
const Contributor = require('./models/contributor.js')
const Group = require('./models/group.js')
const Note = require('./models/note.js')
const Post = require('./models/post.js')
const User = require('./models/user.js')

// Require our "controllers" (i.e. routers)
const appRouter = require('./routes/index.js')
const groupRouter = require('./routes/group.js')
const postRouter = require('./routes/post.js')
const userRouter = require('./routes/user.js')

// Creating our Application
const app = express()

// Include app Settings
const settings = require('./settings.js')

// Passport session setup
passport.serializeUser(function(user,done) {
  done(null, user)
})

passport.deserializeUser(function(obj, done) {
  done(null, obj)
})

// Registeri ng and use our template engine (handlebars)
app.engine('handlebars', hbs({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

// Configure express app
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))
app.use(methodOverride())
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

// Initialize Passport
app.use(passport.initialize())
app.use(passport.session())

// Serving static files (like css) dafd
app.use(express.static('public'))

// Use the spotifyStrategy within passport
// Capture the accessToken and RefreshToken  within the session
// Note: Callback URI must be specified on the Spotify website
passport.use(new SpotifyStrategy({
    clientID: settings.appKey,
    clientSecret: settings.appSecret,
    callbackURL: settings.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne( {username: profile.username}, (err, user) => {
      if( user == null ){
        //create new user
        const newUser = new User({
          username: profile.username,
          displayName: profile.displayName,
          profileUrl: profile.profileUrl,
          token: accessToken,
          rToken: refreshToken,
        })
        newUser.save()
        console.log('Welcome new user')
      }
      else{
        user.username = user.username
        user.displayName = profile.displayName
        user.profileUrl = profile.profileUrl
        user.token = accessToken
        user.rToken = refreshToken
        console.log("User updated")
        user.save()
      }
      return done(err, user)
    })
  }))

// Spotify API setup
var SpotifyWebApi = require('spotify-web-api-node');

// Routes application routes (i.e. controller)
app.use('/', appRouter)
app.use('/group', groupRouter)
app.use('/post', postRouter)
app.use('/users', userRouter)

// Listen on port 3000
app.listen( settings.portNumber, function() {
  console.log( 'listening on ' + settings.portNumber )
})
