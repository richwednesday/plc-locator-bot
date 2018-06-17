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

		case "What is a PVC":
			commands.general(id, payload)
			break; 

		case "Get your PVC":
			commands.general(id, payload)
			break;

		case "Feedback":
			commands.feedback(id, "Ask Feedback")
			break;

		default:
			console.log(`payload ${payload} not from me`)
			break;
	}
}

module.exports = {
	PostbackDispatch,
	PostbackFilter
}