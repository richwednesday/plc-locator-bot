const FBMessenger = require('../ui/messenger')
const messenger = new FBMessenger(process.env.FB_PAGE_TOKEN)
const session = require('../boombot/session')

const fetch = require('node-fetch');

function main(id, payload, details) {
	if (payload === "Location as State") {
    // let available = ["LAGOS", "AKWA IBOM", "FCT"]
    let state = details[0].value
    // if (available.indexOf(state) < 0) return messenger.sendTextMessage(id, "Sorry, your state is not yet available. Check back soon.")
     
    fetch(`${process.env.CORE_URL}/state/lga?state=${state}&masterKey=${process.env.CORE_API_KEY}`)
      .then(res => res.json())
      .then(json => {
        let text = "Please select your LGA by typing a number from the list.\n", i = 1
        for (let location of json.locations) {
          text += "\n" + i + ". " + location
          i++
        }
        messenger.sendTextMessage(id, text)
        session.setState(id, "LGA Number")

        json.locations.push(state)
        session.store(id, json.locations)
      })
      .catch(err => {
        console.log(err)
      })
  }

  else if (payload === "LGA Number") {
    session.retrieve(id, (res) => {
      let num = Number(details[0].value)
      let state = res.pop()
      if (num > res.length) return messenger.sendTextMessage(id, "You have entered an invalid number. Try again.")
      let lga = res[num-1]
      
      fetch(`${process.env.CORE_URL}/pvc/lga?state=${state}&lga=${lga}&masterKey=${process.env.CORE_API_KEY}`)
        .then(res => res.json())
        .then(json => {
          messenger.sendTextMessage(id, `These are the registration centres for ${lga}, ${state} State.`, () => {
            let text = "", i = 1;
            for (let location of json.locations) {
              text += `${i}. ${location.reg_area_centre}, (${location.reg_area})\n\n`
              i++
            }
            messenger.sendTextMessage(id, text, () => extraInfo(id))
            session.delete(id)
          })
        })
        .catch(err => {
          console.log(err)
        })
    })
  }

  else if (payload === "Location as Text") {
    fetch(`https://maps.google.com/maps/api/geocode/json?address=${details}&key=${process.env.MAPS_KEY}`)
      .then(res => res.json())
      .then(json => {
        console.log(json)
        let comp = json.results[0].address_components
        let comp_length = comp.length
        let geo = json.results[0].geometry.location

        if (comp[comp_length - 1].long_name === "Nigeria") main(id, "Location as Coordinates", [geo.lat, geo.lng])
        else messenger.sendTextMessage(id, "Sorry I could not get that. Can you type the State in Nigeria you are in.")
      })
  }

  else if (payload === "Location as Coordinates") {
    fetch(`${process.env.CORE_URL}/pvc/location?geo=${details[0]},${details[1]}&masterKey=${process.env.CORE_API_KEY}`)
      .then(res => res.json())
      .then(json => {
        if (json.based === "lga") {
          messenger.sendTextMessage(id, `These are the registeration centres in ${json.locations[0].lga} Local Government, ${json.locations[0].state} State.`, () => {
            let text = "", i = 1;
            for (let location of json.locations) {
              text += `${i}. ${location.reg_area_centre}, (${location.reg_area})\n\n`
              i++
              if (i > 9) break  
            }
            messenger.sendTextMessage(id, text, () => extraInfo(id))
          }) 
        }
        else {
          if (!json.locations.length) return messenger.sendTextMessage(id, "Sorry I could not get that. Can you type the State in Nigeria you are in.")
          
          messenger.sendTextMessage(id, "These are the registration centres nearest to you.", () => {
            let text = "", i = 1;
            for (let location of json.locations) {
              text += `${i}. ${location.reg_area_centre}, (${location.reg_area})\n\n`
              i++
            }
            messenger.sendTextMessage(id, text, () => extraInfo(id))
          })
        }
      })
      .catch(err => {
        console.log(err)
      })
  }
}

function extraInfo(id) {
  messenger.sendTextMessage(id, "When going, carry documents that say who you are. Like an International Passport, Driver's Licence " +
    "or Birth Certificate. (Not compulsory, but some INEC officials ask)", () => {

    messenger.sendTextMessage(id, "When you're done, they'll give you a slip, a Temporary Voter's Card (TVC). " +
      "That's what you'll collect your PVC with.", () => {

      messenger.sendTextMessage(id, "Ask the INEC people when your PVC will be ready. \nWait and pray. It could take up to 6 months.", () => {
        messenger.sendTextMessage(id, "If you have any question, enter it below. I will try my best to answer or contact someone to help you.")
      })
    })  
  })
  session.setState(id, "Ready for Questions")
}

module.exports = main