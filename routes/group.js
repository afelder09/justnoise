// Require express
const express = require('express')
const request = require('request')
const settings = require('../settings.js')

// Setup Spotify api
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
  clientId : settings.appKey,
  clientSecret : settings.appSecret,
  redirectUri : settings.callbackURL
})

// Require all necessary models
const Group = require('../models/group.js')
const Post = require('../models/post.js')
const User = require('../models/user.js')
const Contributor = require('../models/contributor.js')

// Create router
const groupRouter = express.Router()

// Sepcify get, put, Example, and delete routes
groupRouter.get('/new', ( req, res ) => {
  res.render('group/new', {user: req.user})
})

groupRouter.post('/new', ( req, res ) => {
  // create new playlist
  // Spotify endpoint: https://developer.spotify.com/web-api/create-playlist/
  spotifyApi.setAccessToken(req.session.passport.user.token);
  // Add tracks to a playlist
  spotifyApi.addTracksToPlaylist('596f6b4f63d69d3701102598', '5qlsewlAfwfs7oM0hE5NyU', ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh", "spotify:track:1301WleyT98MSxVHPZCA6M"])
    .then(function(data) {
      console.log('Added tracks to playlist!');
    }, function(err) {
      console.log('Something went wrong!', err);
    });

  // create a new article in the DB
  // render show view for new article
  const newGroup = new Group({
    name: req.body.name,
    spotifyURL: req.body.spotifyURL,
    description: req.body.description,
    creator: req.user.username,
    dateCreated: Date.now()
  })
  // console.log("New group created")
  // console.log(newGroup)
  newGroup.save()


  // add creator as the contributor
  const newContrib = new Contributor({
    groupID: newGroup._id,
    contributorUN: req.user.username,
    contributorDN: req.user.displayName,
    dateJoined: Date.now(),
    creator: true
  })
  newContrib.save()

  res.redirect('/')
})

groupRouter.get('/:id', ( req, res ) => {
  Group.findById( req.params.id, ( err, group ) => {
      Contributor.find( {groupID: group._id}, (err, contributors) => {
      Post.find( {}, (err, posts) => {
        res.render( 'group/show', {group: group, contributors: contributors, posts: posts, user: req.user})
      })
    })
  })
})

groupRouter.get('/add/:id', (req,res) => {
  User.find( {}, (err, users) => {
    res.render( 'group/add', {users: users, user: req.user})
  })
})

groupRouter.post('/add/:id', (req,res) => {
  res.redirect(`/group/${req.params.id}`)
})

groupRouter.get('/edit/:id', (req,res) => {
  Group.findById( {'_id': req.params.id}, ( err,group ) => {
    res.render( 'group/edit', {group: group, user: req.user})
  })
})

groupRouter.post('/edit/:id', (req,res) => {
  Group.findById( {'_id': req.params.id}, ( err,group ) => {
    group.name = req.body.name
    group.description = req.body.description
    group.spotifyURL = req.body.spotifyURL
    group.save()
    res.redirect(`/group/${req.params.id}`)
  })

})

groupRouter.get('/delete/:id', (req,res) => {
  Group.findOne( {'_id':req.params.id}, (err, group) => {
    group.remove(function(){
      res.redirect('/')
    })
  })
})

module.exports = groupRouter
