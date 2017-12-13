// server/config.js
module.exports = {
  AUTH0_DOMAIN: 'kurt-rsvp.auth0.com', // e.g., kmaida.auth0.com
  AUTH0_API_AUDIENCE: 'http://localhost:8083/api/', // e.g., 'http://localhost:8083/api/'
  MONGO_URI: process.env.MONGO_URI || 'mongodb://mongo:mongo@ds137686.mlab.com:37686/kurt-rsvp',
  NAMESPACE: 'http://myapp.com/roles'
};
