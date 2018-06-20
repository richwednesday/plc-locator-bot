const FBMessenger = require('../ui/messenger')
const messenger = new FBMessenger(process.env.FB_PAGE_TOKEN)
const session = require('../boombot/session')

const moment = require('moment');

module.exports = function(id) {
  messenger.getProfile(id, (err, res) => {
    if (err) res = {first_name: ""}

    let elements = [{
      content_type: 'text',
      title: 'Get your PVC',
      payload: 'Get your PVC'
    }, {
      content_type: 'text',
      title: 'What is a PVC',
      payload: 'What is a PVC'
    }]
    messenger.sendQuickRepliesMessage(id, "Good " + getGreetingTime(moment()) + res.first_name + ". You have " + getDateTillDeadline() +
      " days left to get your PVC.\n\nYour PVC is your voice. I can help you find out how to get it.", elements)
    session.setState(id, "Step 1")
  })
}


function getGreetingTime (m) {
	let g = null; //return g
	
	if(!m || !m.isValid()) { return; } //if we can't find a valid or filled moment, we return.
	
	let split_afternoon = 12 //24hr time to split the afternoon
	let split_evening = 17 //24hr time to split the evening
	let currentHour = parseFloat(m.format("HH"));
	
	if(currentHour >= split_afternoon && currentHour <= split_evening) {
		g = "Afternoon ";
	} else if(currentHour >= split_evening) {
		g = "Evening ";
	} else {
		g = "Morning ";
	}
	
	return g;
}

function getDateTillDeadline() {
  let a = moment([2018, 11, 18]);
  let b = moment();
  return a.diff(b, 'days')
}