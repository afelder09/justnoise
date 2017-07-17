// Require express
const express = require('express')

// Require all necessary models
const Post = require('../models/post.js')
const Group = require('../models/group.js')
const trackSearch = require('../public/search.js')

// Create router
const postRouter = express.Router()

// Sepcify get, put, Example, and delete routes
postRouter.get('/new/:id', ( req, res ) => {
  Group.findById( {'_id': req.params.id}, ( err,group ) => {
  res.render('post/new', {group: group, user: req.user})
  })
})

postRouter.post('/new', ( req, res ) => {
  const newPost = new Post({
    spotifyURL: req.body.spotifyURL
  })
  newPost.save()
  res.redirect('/')
})

postRouter.get(':id', (req,res) => {
  Post.findById( {'_id': req.params.id}, ( err, post ) => {

    })
  res.render( 'post/show', { post: post, user: req.user} )
})



module.exports = postRouter
