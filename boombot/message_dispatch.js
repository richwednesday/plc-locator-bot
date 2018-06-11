const commands = require('../commands/commands') 
const PostbackFilter = require('./postback_dispatch').PostbackFilter

const FBMessenger = require('../ui/messenger')
const messenger = new FBMessenger(process.env.FB_PAGE_TOKEN)

const store = require('./store')

function defaultText(id) {
  console.log("default text")
  let text = "I see what you're doing, I really want to help, but for now, I can only give you PVC centres."
  messenger.sendQuickRepliesMessage(id, text, [{content_type: "location"}])
}

function attachmentsHandler(id, attachments, state) {
  if (attachments[0].payload.coordinates) commands.search.processCoordinates(id, attachments[0].payload.coordinates)
  else defaultText(id)
} 

function messageTextHandler(id, message, state) {
  if (message.toLowerCase() === "get started") commands.start(id, message)
  else if (state === "Expecting user Feedback") commands.feedback.thankForFeedback(id)
  else defaultText(id)
}

// Routing for messages
function MessageDispatch(event) {
	const senderID = event.sender.id
  const message = event.message

  console.log(`Received message for user ${senderID} with message: `)
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
    attachmentsHandler(senderID, messageAttachments);
  } 
  
  else if (messageText) {
    // store.getState(senderID, (state) => {
      messageTextHandler(senderID, messageText, null);
    // })
  }
}

module.exports = MessageDispatch