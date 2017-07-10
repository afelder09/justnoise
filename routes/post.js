// Require express
const express = require('express')

// Require all necessary models
const Post = require('../models/post.js')

// Create router
const postRouter = express.Router()

// Sepcify get, put, Example, and delete routes
postRouter.get('/new', ( req, res ) => {
  res.render('post/new')
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
  res.render( 'post/show', { post: post} )
})

module.exports = postRouter
