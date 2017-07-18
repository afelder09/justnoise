// Require express
const express = require('express')

// Require all necessary models
const User = require('../models/user.js')

// Create Router
const userRouter = express.Router()

// Specify routes
userRouter.get('/', ( req, res) => {
  User.find({}, ( err, users ) => {
    res.render('user/allUsers', {users: users, user: req.user})
  })
})

module.exports = userRouter
