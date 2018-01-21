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
    console.log(req.user)
  })
})

userRouter.get('user/:id', (req,res) => {
  User.findOne( {'_id':req.params.id}. err, user) => {
    res.render('user/account', {user: user})
  }
})

userRouter.get('/delete/:id', (req,res) => {
  User.findOne( {'_id':req.params.id}, (err, user) => {
    user.remove(function(){
      res.redirect('user/allUsers')
    })
  })
})

module.exports = userRouter
