const fs = require('fs')
const { Client, Collection, Intents } = require('discord.js')
const client = new Client({ intents: [Intents.FLAGS.GUILDS] })
const { token } = require('./config/config.json')

MICKBOT_BLUE = '#3498DB'
MICKBOT_RED = '#DB3434'
MICKBOT_ORANGE = '#DB6E34'
MICKBOT_GREEN = '#34DB6E'
MICKBOT_YELLOW = '#DBDB34'

makeEmbed = function(description, color) {
	const { MessageEmbed } = require('discord.js')
	const embed = new MessageEmbed()
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

client.on('ready', () => {
	console.log('Ready!')
})

client.on('interactionCreate', async interaction => {
	//console.log(interaction)
	//interaction.reply('Hello!')
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName)

	if (!command) return;

	try {
		await command.execute(interaction)
	} catch (error) {
		console.error(error)
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
	}
})

client.login(token)