const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commentSchema = new Schema({
  commentID: String,
  postID: String,
  userID: String,
  dateCommented: Date,
  comment: String
})

const Post = mongoose.model( 'Post', postSchema )

module.exports = Post
