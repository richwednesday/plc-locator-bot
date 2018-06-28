const redis = require('redis');
const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_URL,
	{no_ready_check: true});

client.on("error", err => console.log("Error " + err));
client.on('connect', () => console.log('Connected to Redis'))

module.exports = {
	setState(id, value) {
		client.set(id, value)
	},

	getState(id, cb) {
		client.get(id, (err, reply) => {
			if (err) {
				console.log(err)
				cb(null)
			}
			else cb(reply)
		})
	},

	store(id, items) {
		if (!items) return
		client.set(`${id}-store`, JSON.stringify(items))
	},

	retrieve(id, cb) {
		client.get(`${id}-store`, (err, reply) => {
			if (err) {
				console.log(err)
				cb(null)
			}
			else cb(JSON.parse(reply))
		})
	},

	delete(id) {
		client.del(`${id}-store`)
	},

	getResponse(intent, cb) {
		console.log("Intent is ", intent)
		client.get(intent, (err, reply) => {
			if (err) {
				console.log(err)
				cb(null)
			}
			else cb(reply)
		})
	}
}