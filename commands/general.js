const FBMessenger = require('../ui/messenger')
const messenger = new FBMessenger(process.env.FB_PAGE_TOKEN)
const session = require('../boombot/session')

module.exports = function(id, payload) {
	if (payload === "What is a PVC") {
		messenger.sendTextMessage(id, "A Permanent Voter's Card (PVC) is issued by the Independent National Electoral Commission (INEC) " +
			"at selected centres across Nigeria. It's the only way you can vote at the polls.", () => {
			
			let element = [{
				content_type: 'text',
				title: 'Get your PVC',
				payload: 'Get your PVC'
			}]
			messenger.sendQuickRepliesMessage(id, "You're eligible to get one if: \n\n1. Nigerian \n2. You're 18 and above.", element)
			session.setState(id, "Step 2")
		})
	}

	else if (payload === "Get your PVC") {
		messenger.sendTextMessage(id, "NB: Registration days are Mondays to Fridays, 9am to 3pm. Public Holidays don't count.", () => {
			messenger.sendQuickRepliesMessage(id, "Now let's get the nearest PVC Registration Center to you. Tell me your location by " +
				"clicking the button below or simply type the state you're in.", [{content_type: "location"}])
		})
		session.setState(id, "Step 3")
	}

}



