// Define app variables
const Settings ={
  portNumber: 3000,
  appKey: '82535849ae2f4181a064eea7b1e416f4',
  appSecret: '12b6be7a85c0494792efff2187174acc',
  callbackURL: 'http://localhost:3000/callback',
  scope: ['user-read-email', 'playlist-read-private', 'playlist-read-collaborative', 'playlist-modify-public', 'playlist-modify-private', 'streaming', 'ugc-image-upload', 'user-follow-modify', 'user-follow-read', 'user-library-read', 'user-library-modify', 'user-read-private', 'user-read-birthdate', 'user-top-read'],
  database: 'mongodb://admin:admin@ds141960.mlab.com:41960/justnoise'
}

module.exports = Settings
