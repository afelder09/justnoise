const mongoose = require('mongoose')
const Schema = mongoose.Schema

const contributorSchema = new Schema({
  userID: String,
  groupID: String,
  groupNotes: Number,
  dateJoined: Date,
  creator: Boolean
})

const Contributor = mongoose.model( 'Contributor', contributorSchema )

module.exports = Contributor
