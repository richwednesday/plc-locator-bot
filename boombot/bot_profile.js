const FBMessenger = require('../ui/messenger')
const messenger = new FBMessenger(process.env.FB_PAGE_TOKEN)

// Sets up greeting screen for the bot
BotProfile = {
	enableGetStarted() {
		// Set call to action button when user is about to address bot
		// for the first time. Handle the payload in postbacks.
		messenger.setMessengerProfile({ 
		  "get_started": {
		    "payload":"Start"
		  }
		})
	},

	setGreeting() {
		// NOTE: You can user {{user_last_name}} or {{user_full_name}} to
		// personalize greeting.
		messenger.setMessengerProfile({
		  greeting: [
		    {
		      locale: 'default',
		      text: "Welcome, {{user_first_name}}! You can get the nearest PVC Registration Centre to you in Nigeria." +
		      	"Click \"GET STARTED\" to begin." 
		    },
		    {
		      locale: 'fr_FR',
		      text: 'Bienvenue, {{user_first_name}}!'
		    }
		  ]
		})
	}
}

module.exports = BotProfile
