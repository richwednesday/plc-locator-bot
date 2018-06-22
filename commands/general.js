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
		let elements = [{
			"content_type": "text",
			"title": "Yes", 
			"payload": "Yes Registered"
		}, {
			"content_type": "text",
			"title": "No",
			"payload": "Not Registered"
		}]

		let text = "Do you have a valid voter registration from 2011 or 2015?\n\nIf you have registered before, type Yes, else type No " +
			"for a new registeration."
		messenger.sendQuickRepliesMessage(id, text, elements, (err, reply) => {
			if (reply) session.setState(id, "Step 3")
		})
	}

	else if (payload === "Yes Registered") {
		let button = [{
			type: "web_url",
			url: "http://www.inecnigeria.org/?page_id=2160",
			title: "Check your status",
			webview_height_ratio: "tall",
			webview_share_button: "hide"
		}]
		let text = "Before doing anything, do not forget to check your status here http://www.inecnigeria.org/?page_id=2160. " +
			"This will give you the most accurate information on your voting status and save you time at your local INEC office."

		messenger.sendButtonsMessage(id, text, button, () => {
			let button = [{
				type: "postback",
				title: "New Registeration", 
				payload: "Not Registered"
			}]
			let text = "If you could not find your details, go and register IMMEDIATELY. To check how and where to register	click below."
			messenger.sendButtonsMessage(id, text, button, () => {
				let text = "If your status is VALID, go and pick up your Permanent Voters Card (PVC) at your Local Government Secretariat " +
					"before December 18th, 2018.\n\nTo check the location of your Local Government Secretariat where you can pick up your " +
					"Permanent Voters Card, click here. https://www.inecnigeria.org/?page_id=5217"
				let button = [{
					type: "web_url",
					url: "https://www.inecnigeria.org/?page_id=5217",
					title: "Pick Up PVC",
					webview_height_ratio: "tall",
					webview_share_button: "hide"
				}]
				messenger.sendButtonsMessage(id, text, button, () => {
					let text = "If you have moved house since 2015 you can move your registration to your new location. Find out here."
					let button = [{
						type: "postback",
						title: "Moved House", 
						payload: "Moved Houses"
					}]
					messenger.sendButtonsMessage(id, text, button, () => {
						let text = "If you lost your Permanent Voters Card (PVC) from 2015, click here."
						let button = [{
							type: "postback",
							title: "Lost PVC", 
							payload: "Lost PVC"
						}]
						messenger.sendButtonsMessage(id, text, button)
					})
				})
			})
		})
	}

	else if (payload === "Moved Houses") {
		let text = "Have you moved since the last election? You can transfer your existing registration to new location so you can participate in upcoming elections."
		messenger.sendTextMessage(id, text, () => {
			messenger.sendTextMessage(id, "Write a letter to INEC's Resident Commissioner in the state you live.", () => {
				messenger.sendFileMessage(id, "https://govote.ng/downloads/SampleTransferLetter.docx", () => {
					messenger.sendTextMessage(id, "☝🏾 Above is a sample letter you can use. Attach your Voter's Card to the letter. " +
						"To avoid stories that touch, make a photocopy of the letter and your voter's card.", () => {
						
						let button = [{
							type: "web_url",
							url: "https://www.inecnigeria.org/?page_id=5217",
							title: "Find INEC Office",
							webview_height_ratio: "tall",
							webview_share_button: "hide"
						}]
						messenger.sendButtonsMessage(id, "Take the letter to the INEC office in your current Local Government Area", button)	
					})
				})
			})
		})
	}

	else if (payload === "Lost PVC") {
		let text = "If your TVC/PVC is lost or damaged, take a photo ID and a passport photograph to INEC’s office in your local government."
		let button = [{
			type: "web_url",
			url: "https://www.inecnigeria.org/?page_id=5217",
			title: "Find INEC Office",
			webview_height_ratio: "tall",
			webview_share_button: "hide"
		}]
		messenger.sendButtonsMessage(id, text, button, () => {
			messenger.sendTextMessage(id, "It's best to do this 30 days before there's an election in your constituency.", () => {
				messenger.sendTextMessage(id, "INEC replaces lost, defaced and mutilated cards FREE OF CHARGE")
			})
		})
	}

	else if (payload === "Not Registered") {
		messenger.sendTextMessage(id, "NB: Registration days are Mondays to Fridays, 9am to 3pm. Public Holidays don't count.", () => {
			messenger.sendTextMessage(id, "When going, carry documents that say who you are. Like an International Passport, Driver's Licence " +
				"or Birth Certificate. (Not compulsory, but some INEC officials ask)", () => {

				messenger.sendTextMessage(id, "When you're done, they'll give you a slip, a Temporary Voter's Card (TVC). " +
					"That's what you'll collect your PVC with.", () => {

					messenger.sendQuickRepliesMessage(id, "Now let's get the nearest PVC Registration Center to you. Tell me your location by " +
						"clicking the button below or simply type the state you're in.", [{content_type: "location"}])
				})
			})
		})
		session.setState(id, "Step 4")
	}

}



