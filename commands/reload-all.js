const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload-all')
		.setDescription('Reload all commands'),

	async execute(interaction) {
		let reloadedCommands = ''

		interaction.client.commands.forEach(async command => {
			delete require.cache[require.resolve(`../commands/${command.data.name}.js`)]

			try {
				const newCommand = require(`../commands/${command.data.name}.js`)
				interaction.client.commands.set(newCommand.data.name, newCommand)

				if (newCommand.onLoad) {
					newCommand.onLoad()
				}

				reloadedCommands += `${newCommand.data.name}, `
			}
			catch (error) {
				console.error(error)

				const embed = new EmbedBuilder()
					.setColor(MICKBOT_RED)
					.setDescription(`There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``)
				await interaction.reply({ embeds: [embed] })
			}
		})

		// Cut ', ' off the end
		reloadedCommands = reloadedCommands.slice(0, -2)
		// Cut very last command off
		const beforeLastCommand = reloadedCommands.slice(0, reloadedCommands.lastIndexOf(' '))
		const lastCommand = reloadedCommands.slice(reloadedCommands.lastIndexOf(' ') + 1)

		reloadedCommands = `${beforeLastCommand} and ${lastCommand}`

		const embed = new EmbedBuilder()
			.setColor(MICKBOT_BLUE)
			.setDescription(`Commands \`${reloadedCommands}\` were reloaded!`)

		await interaction.reply({ embeds: [embed] })

		// Style command name white, bold, and italic
		print(`Commands \x1B[37m\x1B[1m\x1B[3m${reloadedCommands}\x1B[23m\x1B[22m\x1B[39m reloaded!`, 'magenta', '🔄')
	},
}
