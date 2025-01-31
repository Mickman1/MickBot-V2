const fs = require('fs')
const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js')
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] })
const { application } = require('./config/config.json')
const chalk = require('chalk')

client.queues = new Map()

// Global MickBot colors
MICKBOT_BLUE = '#3498DB'
MICKBOT_RED = '#DB3434'
MICKBOT_ORANGE = '#DB6E34'
MICKBOT_GREEN = '#34DB6E'
MICKBOT_YELLOW = '#DBDB34'

makeEmbed = function(description, color) {
	const embed = new EmbedBuilder()
	embed.setColor(color)
	embed.setDescription(description)
	return embed;
}

print = function(message, color = 'white', emoji = '🗒️') {
	console.log(chalk`{cyan [${new Date().toLocaleTimeString()}]} {${color} ${emoji}: ${message}}`)
}

client.commands = new Collection()

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command)
}

client.once('ready', () => {
	print(`Logged in as ${client.user.tag}`, 'yellow', '🤖')

	// Refresh Spotify access token every 45 minutes
	client.commands.get('play').refreshSpotifyAccessToken()
	setInterval(() => {
		client.commands.get('play').refreshSpotifyAccessToken()
	}, 2_700_000)
})

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand())
		return;

	const command = client.commands.get(interaction.commandName)

	if (!command) {
		return;
	}

	try {
		await command.execute(interaction)
	}
	catch (error) {
		console.error(error)
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
	}
})

client.login(application.canary.token)
