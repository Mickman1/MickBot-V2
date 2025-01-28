const fs = require('fs')
const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js')
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] })
const { tokens } = require('./config/config.json')

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

client.commands = new Collection()

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command)
}

client.once('ready', () => {
	console.log('Ready!')
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

client.login(tokens.discord.canary)
