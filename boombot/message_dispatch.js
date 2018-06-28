const commands = require('../commands/commands') 
const PostbackFilter = require('./postback_dispatch').PostbackFilter

const FBMessenger = require('../ui/messenger')
const messenger = new FBMessenger(process.env.FB_PAGE_TOKEN)

const session = require('./session')

let yesReplies = ["yes", "yea", "yup", "ya", "yep", "totally", "totes", "yes please", "of course", "sure", "you bet", "for sure", 
  "sure thing", "certainly", "definitely", "yeah", "yh", "yo", "absolutely", "undoubtedly", "aye"]
let noReplies = ["no", "nope", "naa", "nah", "neh", "nay", "at all", "not at all", "negative", "Uhn Uhn", "no way", "nop"]



function defaultText(id, message) {
  console.log("default text")

  // this is a very simple logic 
  if (message.length < 5) commands.start(id)
  else {
    messenger.sendTextMessage(id, "I will forward your message to someone who can assist you. You can also type 'start' to begin again.")
    // messenger.passThreadControl(id, "263902037430900")
  }
}

function attachmentsHandler(id, attachments, state) {
  if (attachments[0].payload.coordinates) 
    commands.search(id, "Location as Coordinates", [attachments[0].payload.coordinates.lat, attachments[0].payload.coordinates.long])
  else if (state === "Step 1") commands.general(id, "What is a PVC")
  else if (state === "Step 2") commands.general(id, "Get your PVC")
  else if (state === "Expecting Feedback") commands.feedback(id, "Received Feedback")
  else defaultText(id)
} 

function messageTextHandler(id, message, nlp, state) {
  if (message.toLowerCase() === "get started" || message.toLowerCase() === "start") commands.start(id)
  
  else if (state === "Step 1") commands.general(id, "What is a PVC")
  else if (state === "Step 2") commands.general(id, "Get your PVC")
  else if (state === "Step 3") {
    if (yesReplies.indexOf(message) >= 0) commands.general(id, "Yes Registered")
    else if (noReplies.indexOf(message) >= 0) commands.general(id, "Not Registered")
    else messenger.sendTextMessage(id, "Type Get started to begin again.") 
  }

  else if (nlp.states && state === "Step 4") commands.search(id, "Location as State", nlp.states) 
  else if (state === "Step 4") commands.search(id, "Location as Text", message)  

  else if (nlp.number && state === "LGA Number") commands.search(id, "LGA Number", nlp.number) 

  else if (state === "Expecting Feedback") commands.feedback(id, "Received Feedback", message)
  
  else if (nlp.intent) {
    session.getResponse(nlp.intent[0].value, (reply) => {
      reply ? messenger.sendTextMessage(id, reply) : defaultText(id, message)
    }) 
  }

  else defaultText(id, message)
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