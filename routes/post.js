// Require express
const express = require('express')
const settings = require('../settings.js')

// Setup Spotify api
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
  clientId : settings.appKey,
  clientSecret : settings.appSecret,
  redirectUri : settings.callbackURL
})

// Require all necessary models
const Post = require('../models/post.js')
const Group = require('../models/group.js')
const trackSearch = require('../public/scripts/searchTrack.js')

// Create router
const postRouter = express.Router()

// Sepcify get, put, Example, and delete routes
postRouter.get('/new/:id', ( req, res ) => {
  Group.findById( {'_id': req.params.id}, ( err,group ) => {
    res.render('post/new', {group: group, user: req.user})
  })
})

postRouter.post('/new/:id', ( req, res ) => {
  Group.findById( {'_id': req.params.id}, ( err,group ) => {
    const newPost = new Post({
      datePosted: Date.now(),
      username: req.user.username,
      spotifyURL: req.body.spotifyURL,
      groupID: req.params.id
    })

    newPost.save()

    // Add track to group playlist
    spotifyApi.getUserPlaylists('ansonfelder')
      .then(function(data) {
        console.log('User playlists', data);
      }, function(err) {
        console.error(err);
      });

    // Redirect back to group page
    res.redirect(`/group/${req.params.id}`)
  })
})

postRouter.get(':id', (req,res) => {
  Post.findById( {'_id': req.params.id}, ( err, post ) => {
      res.render( 'post/show', { post: post, user: req.user} )
  })
})

module.exports = postRouter
