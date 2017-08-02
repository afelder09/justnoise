// All our requires/dependencies
const express = require('express')
const bodyParser = require('body-parser')
const hbs = require('express-handlebars')
const mongoose = require('mongoose')

// Connect to our Mongo database, using Mongoose and include our models
mongoose.connect('mongodb://admin:password1$@dopeondope-shard-00-00-32pjn.mongodb.net:27017,dopeondope-shard-00-01-32pjn.mongodb.net:27017,dopeondope-shard-00-02-32pjn.mongodb.net:27017/<DATABASE>?ssl=true&replicaSet=DopeOnDope-shard-0&authSource=admin')

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

// Serving static files (like css)
app.use(express.static('public'))

// Use Body Parser
app.use(bodyParser.urlencoded({extended: true}))

// Routes application routes (i.e. controller)
app.use('/', appRouter)
app.use('/group', groupRouter)
app.use('/post', postRouter)

// Listen on port 3000
app.listen( 3002, () => {
  console.log( 'listening on 3002' )
})
