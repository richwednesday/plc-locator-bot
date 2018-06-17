const FBMessenger = require('../ui/messenger')
const messenger = new FBMessenger(process.env.FB_PAGE_TOKEN)
const session = require('../boombot/session')

const fetch = require('node-fetch');

module.exports = function(id, payload, details) {
	if (payload === "Location as State") {
    // fetch(`${process.env.CORE_URL}/lgas`)
  }

  else if (payload === "Location as Text") {

  }

  else if (payload === "Location as Coordinates") {
    
  }
}