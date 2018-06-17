const FBMessenger = require('../ui/messenger')
const messenger = new FBMessenger(process.env.FB_PAGE_TOKEN)
const session = require('../boombot/session')

const fetch = require('node-fetch');

function main(id, payload, details) {
	if (payload === "Location as State") {
    let available = ["LAGOS", "AKWA IBOM", "FCT"]
    let state = details[0].value
    if (available.indexOf(state) < 0) return messenger.sendTextMessage(id, "Sorry, your state is not yet available. Check back soon.")
     
    fetch(`${process.env.CORE_URL}/state/lga?state=${state}&masterKey=${process.env.CORE_API_KEY}`)
      .then(res => res.json())
      .then(json => {
        let text = "Please select your LGA by typing a number from the list.\n"
        for (let location of json.locations) {
          text += "\n" + location
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
              text += `${i}. ${location.reg_area_centre} ${location.reg_area}`
            }
            messenger.sendTextMessage(id, text)
            session.delete(id)
          })
        })
        .catch(err => {
          console.log(err)
        })
    })
  }

  else if (payload === "Location as Text") {
    fetch(`http://api.opencagedata.com/geocode/v1/json?q=${details}&key=${process.env.OPEN_CAGE_KEY}`)
      .then(res => res.json())
      .then(json => {
        if (json.results[0].components.country !== "Nigeria") 
          return messenger.sendTextMessage(id, "Sorry I could not get that location. Can you type your State instead.")

        main(id, "Location as Coordinates", json.results[0].components.geometry)
      })
  }

  else if (payload === "Location as Coordinates") {
    fetch(`${process.env.CORE_URL}/pvc/location?geo=${details.lat},${details.long}&masterKey=${process.env.CORE_API_KEY}`)
      .then(res => res.json())
      .then(json => {
        if (json.type === "lga") {
          messenger.sendTextMessage(id, `I see you're in ${lga} Local Government, ${state} State. These are the centres near you.`, () => {
            let text = "", i = 1;
            for (let location of json.locations) {
              text += `${i}. ${location.reg_area_centre}, ${location.reg_area}`
            }
            messenger.sendTextMessage(id, text)
          }) 
        }
        else {
          messenger.sendTextMessage(id, "These are the registration centres nearest to you.", () => {
            let text = "", i = 1;
            for (let location of json.locations) {
              text += `${i}. ${location.reg_area_centre}, ${location.reg_area}`
            }
            messenger.sendTextMessage(id, text)
          })
        }
      })
      .catch(err => {
        console.log(err)
      })
  }
}

module.exports = main