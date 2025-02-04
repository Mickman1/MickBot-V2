const fs = require('fs')
const { Client, Collection, GatewayIntentBits, EmbedBuilder, MessageFlags } = require('discord.js')
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
	let formattedTime = `[${new Date().toLocaleTimeString()}]`
	// Make all log messages start with the same spacing
	if (formattedTime.length === 12) {
		formattedTime += ' '
	}
	console.log(chalk`{cyan ${formattedTime}} {${color} ${emoji}: ${message}}`)
}

client.commands = new Collection()

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command)

	if (command.onLoad) {
		command.onLoad()
	}
}

client.once('ready', () => {
	print(`Logged in as ${client.user.tag}`, 'yellow', '🤖')
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

		const embed = new EmbedBuilder()
			.setColor(MICKBOT_RED)
			.setDescription('There was an error while executing this command!')
		await interaction.followUp({ embeds: [embed], flags: MessageFlags.Ephemeral })
	}
})

client.login(application.canary.token)
