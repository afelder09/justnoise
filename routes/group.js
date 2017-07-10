// Require express
const express = require('express')

// Require all necessary models
const Group = require('../models/group.js')
const Post = require('../models/post.js')

// Create router
const groupRouter = express.Router()

// Sepcify get, put, Example, and delete routes
groupRouter.get('/new', ( req, res ) => {
  res.render('group/new')
})

groupRouter.post('/new', ( req, res ) => {
  // create a new article in the DB
  // render show view for new article
  const newGroup = new Group({
    name: req.body.name,
    spotifyURL: req.body.spotifyURL,
    description: req.body.description
  })
  // console.log("New group created")
  // console.log(newGroup)
  newGroup.save()
  res.redirect('/')
})

groupRouter.get('/:id', ( req, res ) => {
  Group.findById( req.params.id, ( err, group ) => {
    res.render( 'group/show', {group: group})
  })
})

groupRouter.get('/edit/:id', (req,res) => {
  Group.findById( {'_id': req.params.id}, ( err,group ) => {
    res.render( 'group/edit', {group: group})
  })
})

groupRouter.post('/edit/:id', (req,res) => {
  Group.findById( {'_id': req.params.id}, ( err,group ) => {
    group.name = req.body.name
    group.description = req.body.description
    group.save()
    res.redirect(`/group/${req.params.id}`)
  })

})

module.exports = groupRouter
