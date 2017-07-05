// Require express
const express = require('express')

// Require necessary models
// const Contributor = require('../models/contributor.js')
const Group = require('../models/group.js')
const Note = require('../models/note.js')
const Post = require('../models/post.js')
const User = require('../models/user.js')

// Create the route
const appRouter = express.Router()

// Specify all the get, post, put, and delete requests
appRouter.get('/', ( req , res ) => {
  // index route
  // list every article
  Group.find({}, ( err, groups ) => {

    res.render('index', { groups: groups })

  })

})

//include in model
module.exports = appRouter
