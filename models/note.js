const mongoose = require('mongoose')
const Schema = mongoose.Schema

const noteSchema = new Schema({
  noteID: String,
  postID: String,
  dateLiked: Date,
  userID: String,
  internal: Boolean
})

const Note = mongoose.model( 'Note', noteSchema )

module.exports = Note
