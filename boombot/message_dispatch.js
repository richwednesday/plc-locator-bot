const commands = require('../commands/commands') 
const PostbackFilter = require('./postback_dispatch').PostbackFilter

const session = require('./session')

function defaultText(id) {
  console.log("default text")
  
}

function attachmentsHandler(id, attachments, state) {
  if (attachments[0].payload.coordinates) commands.search(id, "Location as Coordinates", attachments[0].payload.coordinates)
  else if (state === "Step 1") commands.general(id, "What is a PVC")
  else if (state === "Step 2") commands.general(id, "Get your PVC")
  else if (state === "Expecting Feedback") commands.feedback(id, "Received Feedback")
  else defaultText(id)
} 

function messageTextHandler(id, message, nlp, state) {
  if (message.toLowerCase() === "get started") commands.start(id)
  
  else if (state === "Step 1") commands.general(id, "What is a PVC")
  else if (state === "Step 2") commands.general(id, "Get your PVC")

  else if (nlp.states && state === "Step 3") commands.search(id, "Location as State", nlp.states) 
  else if (state === "Step 3") commands.search(id, "Location as Text", message)  

  else if (nlp.number && state === "LGA Number") commands.search(id, "LGA Number", nlp.number) 

  else if (state === "Expecting Feedback") commands.feedback(id, "Received Feedback", message)
  else defaultText(id)
}

// Routing for messages
function MessageDispatch(event) {
	const senderID = event.sender.id
  const message = event.message

  console.log(message)

  // You may get a text, attachment, or quick replies but not all three
  let messageText = message.text;
  let messageAttachments = message.attachments;
  let quickReply = message.quick_reply;
  
  // Quick Replies contain a payload so we take it to the Postback
  if (quickReply) {
    PostbackFilter(senderID, quickReply.payload);
  }

  else if (messageAttachments) {
    session.getState(senderID, (state) => {
      attachmentsHandler(senderID, messageAttachments, state);
    })
  } 
  
  else if (messageText) {
    session.getState(senderID, (state) => {
      let nlp = message.nlp.entities || {}
		
      messageTextHandler(senderID, messageText, nlp, state);
    })
  }
}

module.exports = MessageDispatch