const { Command } = require('commander')
const program = new Command()
program
	.name('node deploy-commands')
	.description('Deploy application commands to Discord API')
	.option('-g, --guild <Guild ID>', 'Set guild for guild command registration')
	.option('-G, --global', 'Register commands globally')
	.option('-c, --clear', 'Clear all commands from the application')
	.option('-a, --application <Application Name>', 'Application to register commands to')
	.helpOption('-h, --help', 'Show help information')
	.parse()
const options = program.opts()

const fs = require('fs')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { clientId, guildId, tokens } = require('./config/config.json')

const deploymentType = options.global ? 'global' : 'guild'
const deploymentGuildId = options.guild || guildId
let commands = []

if (!options.clear) {
	const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
	
	for (const file of commandFiles) {
		const command = require(`./commands/${file}`)
		commands.push(command.data.toJSON())
	}
}

const rest = new REST({ version: '9' }).setToken(tokens.discord.canary)

if (deploymentType === 'guild') {
	rest.put(Routes.applicationGuildCommands(clientId, deploymentGuildId), { body: commands })
		.then(() => console.log('Successfully registered guild application commands.'))
		.catch(console.error)
}

if (deploymentType === 'global') {
	rest.put(Routes.applicationCommands(clientId), { body: commands })
		.then(() => console.log('Successfully registered global application commands.'))
		.catch(console.error)
}
