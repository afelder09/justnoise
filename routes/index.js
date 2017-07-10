// Require express
const express = require('express')
const passport = require('passport')

// Require necessary models
// const Contributor = require('../models/contributor.js')
const Group = require('../models/group.js')
const Note = require('../models/note.js')
const Post = require('../models/post.js')
const User = require('../models/user.js')

// Create the route
const appRouter = express.Router()

// Specify all the get, post, put, and delete requests
// Index route
appRouter.get('/', ( req , res ) => {
  // index route
  // list every article
  Group.find({}, ( err, groups ) => {

    res.render('index', { groups: groups })

  })

})

// Authenticate with Spotify
appRouter.get('/auth/spotify',
  passport.authenticate('spotify'),
  function(req, res){
    // The request will be redirected to spotify for authentication, so this
    // function will not be called.
  });

appRouter.get('/auth/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

//include in model
module.exports = appRouter
