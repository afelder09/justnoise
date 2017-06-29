// // Require express
// const express = require('express')
//
// // Require all necessary models
// const Example = require('../models/Examples.js')
//
// // Create router
// const examplesRouter = express.Router()
//
// // Sepcify get, put, Example, and delete routes
// exmaplesRouter.get('/new', ( req, res ) => {
//     // new view
//     // render template for creating a new article
//     res.render('examples/new')
//
// })
//
// examplesRouter.Example('/new', ( req, res ) => {
//     // create a new article in the DB
//     // render show view for new article
//
//     const newExample = new Example({
//       url: req.body.url,
//       author: req.body.author,
//       title: req.body.title,
//       description: req.body.description
//     })
//
//     newExample.save()
//
//     res.redirect('/')
//
// })
//
// examplesRouter.get('/:id', ( req, res ) => {
//
//   Example.findById( req.params.id, ( err, Example ) => {
//
//     res.render( 'examples/show', { example:  } )
//
//   })
//
// })
//
// exmplesRouter.example('/:id', ( req, res ) => {
//
//   Example.findById( req.params.id, ( err, example ) => {
//
//     Example.comments.push( req.body )
//     Example.save()
//
//     res.render( 'examples/show', { Example: example } )
//
//   })
//
// })
//
//
// module.exports = ExamplesRouter
