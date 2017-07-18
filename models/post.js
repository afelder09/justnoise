const mongoose = require('mongoose')
const Schema = mongoose.Schema

const postSchema = new Schema({
  datePosted: Date,
  spotifyURL: String,
  username: String,
  groupID: String,
  numberOfNotes: Number,
  comment: String
})

const Post = mongoose.model( 'Post', postSchema )

module.exports = Post
