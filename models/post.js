const mongoose = require('mongoose')
const Schema = mongoose.Schema

const postSchema = new Schema({
  postID: String,
  userID: String,
  groupID: String,
  spotifyID: String,
  datePosted: Date,
  comment: String
})

const Post = mongoose.model( 'Post', postSchema )

module.exports = Post
