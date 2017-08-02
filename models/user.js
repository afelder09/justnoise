const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  username: String,
  displayName: String,
  profileUrl: String,
  totalNotes: Number,
  token: String,
  rToken: String
})

const User = mongoose.model( 'User', userSchema )

module.exports = User
