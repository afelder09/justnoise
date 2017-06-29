// // Require express
// const express = require('express')
//
// // Require necessary models
// const Post = require('../models/posts.js')
//
// // Create the route
// const appRouter = express.Router()
//
// // Specify all the get, post, put, and delete requests
// appRouter.get('/', ( req , res ) => {
//   // index route
//   // list every article
//   Post.find({}, ( err, posts ) => {
//
//     res.render('index', { posts: posts })
//
//   })
//
// })
//
// //include in model
// module.exports = appRouter
