const FBMessenger = require('../ui/messenger')
const messenger = new FBMessenger(process.env.FB_PAGE_TOKEN)

// Enables persistent menu for your bot
PersistentMenu = {
  enable() {
  	// Design your persistent menu here:
  	messenger.setMessengerProfile({
      persistent_menu: [
        {
          locale: 'default',
          composer_input_disabled: false,
          call_to_actions: [
            {
              type: 'postback',
              title: '🔍 Find PVC Centre',
              payload: 'Create'
            },
            {
              type: 'postback',
              title: '🔦 Give Feedback',
              payload: 'Feedback'
            }
          ]
        }
      ]
    })
  }
}

module.exports = PersistentMenu
