// Require express
const express = require('express')
const passport = require('passport')
const request = require('request')
const settings = require('../settings.js')

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
  Group.find({}, ( err, groups ) => {
    res.render('index', { groups: groups, user: req.user })
  })
})

appRouter.get('/account', ensureAuthenticated, function(req, res){
  res.render('user/account', {user: req.user})
})

// Get /auth/spotify
appRouter.get('/auth/spotify',
  passport.authenticate('spotify', {scope: settings.scope, showDialog: false}),
  function(req, res){
})

// Callback that also creates a new user object if the user hasnt logged in before
appRouter.get('/callback',
  passport.authenticate('spotify', { failureRedirect: '/' }),
  function(req, res) {
    // console.log("Access token: ", req.session.passport.user.token)
    res.redirect('/')
})

appRouter.get('/logout', function(req, res){
  req.logout()
  res.redirect('/')
});

// Get authorization token
appRouter.get('/authorize', ( req, res) => {
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
