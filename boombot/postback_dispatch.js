const commands = require('../commands/commands') 

// Routing for postbacks
function PostbackDispatch(event) {
	let senderID = event.sender.id
  let payload = event.postback.payload

  PostbackFilter(senderID, payload)
}

function PostbackFilter(id, payload) {
	switch (payload) {
		case "Start":
			commands.start(id)
			break;

		case "Search":
			commands.search.getLocation(id)
			break; 

		case "Feedback":
			commands.feedback.askForFeedback(id)
			break;

		default:
			console.log(`payload ${payload} not from me`)
			break;
	}
}

function subFilter(id, payload) {
	let newload = payload.split(",")
			
	switch (newload[0]) {
		case "Geometry":
			let coordinates = {lat: newload[1], long: newload[2]}
			commands.search.processCoordinates(id, coordinates)
			break;

		case "More Events":
			commands.search.processNextPage(id, newload[1])
			break;

		case "Topic":
			commands.search.processTopic(id, newload[1])
			break;

		default:
			console.log("Not finding the postback")


	}
}

module.exports = {
	PostbackDispatch,
	PostbackFilter
}