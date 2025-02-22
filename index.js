const fs = require('fs')
const { Client, Collection, GatewayIntentBits, EmbedBuilder, MessageFlags, ActivityType } = require('discord.js')
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] })
const { applications } = require('./config/config.json')
const chalk = require('chalk')

client.queues = new Map()
client.malatroGames = new Map()

// Global MickBot colors
MICKBOT_RED = '#DB3434'
MICKBOT_ORANGE = '#DB6E34'
MICKBOT_YELLOW = '#DBDB34'
MICKBOT_GREEN = '#34DB6E'
MICKBOT_BLUE = '#3498DB'

print = function(message, color = 'white', emoji = '🗒️') {
	let formattedTime = `${new Date().toLocaleTimeString()}:`
	// Make all log messages start with the same spacing
	if (formattedTime.length === 11) {
		formattedTime += ' '
	}
	console.log(chalk`{cyan ${formattedTime}} {${color} ${emoji} ${message}}`)
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

	client.user.setActivity('👋', { type: ActivityType.Custom })
})

client.on('interactionCreate', async interaction => {
	if (interaction.isButton()) {
		switch (interaction.customId) {
			case 'discard':
				client.commands.get('malatro').discardHand(interaction)
				break
			case 'rank':
				client.commands.get('malatro').sortHandByRank(interaction)
				break
			case 'suit':
				client.commands.get('malatro').sortHandBySuit(interaction)
				break
		}
	}

	if (interaction.isStringSelectMenu()) {
		if (interaction.customId === 'handSelection') {
			client.commands.get('malatro').selectCards(interaction)
		}
	}

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

client.login(applications.canary.token)
