// All our requires/dependencies
const express = require('express')
const bodyParser = require('body-parser')
const hbs = require('express-handlebars')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const SpotifyStrategy = require('passport-spotify').Strategy

// Connect to our Mongo database, using Mongoose and include our models
mongoose.connect('mongodb://admin:Password1$@cluster0-shard-00-00-32pjn.mongodb.net:27017,cluster0-shard-00-01-32pjn.mongodb.net:27017,cluster0-shard-00-02-32pjn.mongodb.net:27017/justnoise?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin')

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

// Creating our Application
const app = express()

// Registering and use our template engine (handlebars)
app.engine('handlebars', hbs({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

// Set up authentication
app.use(cookieParser())
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

// Establish Passport Spotify Strategy
const client_id = '82535849ae2f4181a064eea7b1e416f4'
const client_secret = '12b6be7a85c0494792efff2187174acc'

passport.use(new SpotifyStrategy({
  clientID: client_id,
  clientSecret: client_secret,
  callbackURL: "http://localhost:8888/auth/spotify/callback"
  },
  function(accessToken, refreshToken, profile, done){
    User.findOrCreate({ spotifyId: profile.id}, function (err, user) {
      return done(err, user);
    })
  }
))

// Serving static files (like css)
app.use(express.static('public'))

// Use Body Parser
app.use(bodyParser.urlencoded({extended: true}))

// Routes application routes (i.e. controller)
app.use('/', appRouter)
app.use('/group', groupRouter)
app.use('/post', postRouter)

// Spotify API Setup
const http = require("http")

// Listen on port 3000
app.listen( 3006, function() {
  console.log( 'listening on 3006' )
})
