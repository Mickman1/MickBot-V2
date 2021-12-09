let { Client, Intents } = require('discord.js')
let client = new Client({ intents: [Intents.FLAGS.GUILDS] })
const { token } = require('./config.json')

client.login(token)
client.on('ready', () => {
	console.log('Ready!')
	
	client.guilds.cache.forEach(guild => { console.log(guild.name) })
})