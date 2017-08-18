const mongoose = require('mongoose')
const Schema = mongoose.Schema

const groupSchema = new Schema({
  groupID: String,
  name: String,
  dateCreated: Date,
  playlistID: String,
  description: String
})

const Group = mongoose.model( 'Group', groupSchema )

module.exports = Group
