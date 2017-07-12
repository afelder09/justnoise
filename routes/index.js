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

appRouter.get('/accout', ensureAuthenticated, function(req, res){
  res.render('user/account', {user: req.user})
})

appRouter.get('/login', function(req, res){
  console.log('In login router')
  res.render('user/login', {user: req.user})
})

// Get /auth/spotify
appRouter.get('/auth/spotify',
  passport.authenticate('spotify', {scope: ['user-read-email', 'user-read-private'], showDialog: true}),
  function(req, res){

})

appRouter.get('/callback',
  passport.authenticate('spotify', {failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/')
})

// Simple route middleware to ensure isre is authenticated
function ensureAuthenticated(req, res, next) {
  if( req.isAuthenticated()) {return next()}
  res.redirect('/user/login')
}

//include in model
module.exports = appRouter
