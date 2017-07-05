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
    console.log(newPost)
    newPost.save()
    res.redirect('/')
})

module.exports = postRouter
