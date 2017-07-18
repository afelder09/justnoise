// Require express
const express = require('express')
const passport = require('passport')
const request = require('request')

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
  // list every group
  console.log(req.user)
  Group.find({}, ( err, groups ) => {
    res.render('index', { groups: groups, user: req.user })
  })

  console.log("Session: ", req.session.token)
})

appRouter.get('/account', ensureAuthenticated, function(req, res){
  res.render('user/account', {user: req.user})
})

// Get /auth/spotify
appRouter.get('/auth/spotify',
  passport.authenticate('spotify', {scope: ['user-read-email', 'user-read-private'], showDialog: true}),
  function(req, res){
})

// Callback that also creates a new user object if the user hasnt logged in before
appRouter.get('/callback',
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/')
})

appRouter.get('/logout', function(req, res){
  req.logout()
  res.redirect('/')
});

// Get authorization token
appRouter.get('/authorize', ( req, res) => {
  console.log("Test")
  var request = new XMLHttpRequest()

  request.addEventListener('load', handleRequest)
  request.open('GET' ,url) //takes two arguments 1. the type of request 2. where we are making our request
  request.setRequestHeader('Authorization','Bearer ' + token)
  request.setRequestHeader('Accept', 'application/json')
  // request.setRequestHeader('Access-Control-Allow-Headers','*')
  request.send()
})

// Track search
appRouter.get('/trackSearch', (req,res) => {
  console.log("Searching for tracks")
})

// Simple route middleware to ensure isre is authenticated
function ensureAuthenticated(req, res, next) {
  if( req.isAuthenticated()) {return next()}
  res.redirect('/user/login')
}

//include in model
module.exports = appRouter
