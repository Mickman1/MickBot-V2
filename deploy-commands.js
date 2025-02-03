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
const { application, guildIds } = require('./config/config.json')

const deploymentType = options.global ? 'global' : 'guild'
const deploymentGuildIds = options.guild ? [options.guild] : guildIds
const deploymentClientId = options.application ? application[options.application].clientId : application.canary.clientId
const deploymentToken = options.application ? application[options.application].token : application.canary.token

// Register an empty array of commands with --clear, skip command loading
const commands = []
if (!options.clear) {
	const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

	for (const file of commandFiles) {
		const command = require(`./commands/${file}`)
		commands.push(command.data.toJSON())
	}
}

const rest = new REST({ version: '9' }).setToken(deploymentToken)

if (deploymentType === 'guild') {
	for (let i = 0; i < deploymentGuildIds.length; i++) {
		rest.put(Routes.applicationGuildCommands(deploymentClientId, deploymentGuildIds[i]), { body: commands })
			.then(() => console.log(`Successfully registered guild application commands for ${deploymentGuildIds[i]}.`))
			.catch(console.error)
	}
}

if (deploymentType === 'global') {
	rest.put(Routes.applicationCommands(deploymentClientId), { body: commands })
		.then(() => console.log('Successfully registered global application commands.'))
		.catch(console.error)
}
