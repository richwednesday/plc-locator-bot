const FBMessenger = require('../ui/messenger')
const messenger = new FBMessenger(process.env.FB_PAGE_TOKEN)
const session = require('../boombot/session')

const fetch = require('node-fetch');

function main(id, payload, details) {
	if (payload === "Location as State") {
    let state = details[0].value
     
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
        util.sendErrorMessage(id)
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
            util.sendScrollMessage(id, json.locations)
          })
        })
        .catch(err => {
          console.log(err)
          util.sendErrorMessage(id)
        })
    })
  }

  else if (payload === "Location as Text") {
    fetch(`https://maps.google.com/maps/api/geocode/json?address=${details}&key=${process.env.MAPS_KEY}`)
      .then(res => res.json())
      .then(json => {
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
            util.sendScrollMessage(id, json.locations)
          }) 
        }
        else {
          if (!json.locations.length) return messenger.sendTextMessage(id, "Sorry I could not get that. Can you type the State in Nigeria you are in.")
          
          messenger.sendTextMessage(id, "These are the registration centres near you.", () => {
            util.sendScrollMessage(id, json.locations)
          })
        }
      })
      .catch(err => {
        console.log(err)
        util.sendErrorMessage(id)
      })
  }

  else if (payload === "Load More PVC") {
    session.retrieve(id, (res) => {
      if (!res) return messenger.sendTextMessage(id, "Sorry, I could not find more data.")
      console.log(res)

      util.sendScrollMessage(id, res)
      session.delete(id)
    })
  }
}


let util = {
  sendScrollMessage(id, locations) {
    let elements = []
    for (let location of locations) {
      elements.push({
        title: location.reg_area,
        subtitle: location.reg_area_centre + "\nClick Contribute to suggest address.",
        image_url: "http://res.cloudinary.com/ubadj/image/upload/v1529652086/050AD750-ABBF-4AB0-A5AA-43BA06C87601.jpg",
        buttons: [{
          type: "postback",
          title: "Contribute",
          payload: "Contribute"
        }]
      })
      if (elements.length === 9) break;
    }
    if (locations.length > 9) {
      elements.push({
        title: "Load More Registration Centres in this Area.",
        image_url: "http://res.cloudinary.com/ubadj/image/upload/v1529652086/050AD750-ABBF-4AB0-A5AA-43BA06C87601.jpg",
        buttons: [{
          type: "postback",
          title: "Load More",
          payload: "Load More PVC"
        }]
      })
      session.store(id, locations.slice(9))
    }
    else session.delete(id)

    messenger.sendHScrollMessage(id, elements)
  },
  
  sendErrorMessage(id) {
    messenger.sendTextMessage(id, "An Error occured displaying the information you requested. Please retry later.")
  }
}

module.exports = main