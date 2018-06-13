const FBMessenger = require('../ui/messenger')
const messenger = new FBMessenger(process.env.FB_PAGE_TOKEN)

module.exports = function(id) {
  messenger.getProfile(id, (err, res) => {
    if (err) body = {}

    messenger.sendTextMessage(id, "Hello " + res.first_name + "! It is good to have you here, and know you're interested in getting your " +
      "PVC for the upcoming elections. 😁", (err, body) => {
      
      let text = "My name is Noah, and I can get the nearest PVC centres to you. Just click the Send Location button below so I can know " +
        "where you are first."
      messenger.sendQuickRepliesMessage(id, text, [{content_type: "location"}, {content_type: 'text', title: 'No, Noah 😞', payload: 'First No'}])    
    })
  })
}
