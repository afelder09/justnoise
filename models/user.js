const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  userID: String,
  spotifyID: String,
  displayName: String,
  totalNotes: Number
})

const User = mongoose.model( 'User', userSchema )

module.exports = User
