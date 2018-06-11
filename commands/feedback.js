const FBMessenger = require('../ui/messenger')
const messenger = new FBMessenger(process.env.FB_PAGE_TOKEN)
const store = require('../boombot/store')

module.exports = {
	askForFeedback(id) {
		messenger.sendTextMessage(id, "Ha, would love to know where you think I suck, what you'd suggest I do, and how I can be better.", (e, b) => {
			messenger.sendTextMessage(id, "Being Noah, I'm probably way older than you, but I still find your advice very valuable. 🥺 😊")
		})
		store.setState(id, "Expecting user Feedback") 
	},

	thankForFeedback(id) {
		messenger.sendTextMessage(id, "Thank you for your feedback.")
		store.setState(id, "Got User Feedback")
	}
}
