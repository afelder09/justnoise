const mongoose = require('mongoose')
const Schema = mongoose.Schema

const postSchema = new Schema({
  postID: String,
  datePosted: Date,
  spotifyURL: String,
  numberOfNotes: Number
})

const Post = mongoose.model( 'Post', postSchema )

module.exports = Post
