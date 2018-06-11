const FBMessenger = require('../ui/messenger')
const messenger = new FBMessenger(process.env.FB_PAGE_TOKEN)
const fetch = require('node-fetch')

const sendRequest = function(endpoint, cb) {
	fetch(`${process.env.CORE_URL}${endpoint}`)
		.then(res => res.json())
    .then(json => cb(null, json))
    .catch(err => {
    	console.log(err)
    	cb (err)
    })
}

let orb = {
	processCoordinates(id, coordinates) {
		orb.sendEvents(id, coordinates)

		store.setLocation(id, JSON.stringify({
			lat: coordinates.lat, 
			long: coordinates.long
		}))
	  store.setState(id, "Got users location")
    saveUserLocation(id, coordinates)
	},

	spoolEvents(id) {
		store.getLocation(id, (location) => {
			location ? orb.sendEvents(id, JSON.parse(location)) :
				orb.getLocation(id)	 
		})
    store.setState(id, "About to spool")
	}
} 

module.exports = orb



