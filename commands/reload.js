const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reload a command')
		.addStringOption(option =>
			option.setName('command')
				.setDescription('The command to reload')
				.setRequired(true)
		),

	async execute(interaction) {
		const commandName = interaction.options.getString('command', true).toLowerCase()
		const command = interaction.client.commands.get(commandName)

		if (!command) {
			const embed = new EmbedBuilder()
				.setColor(MICKBOT_RED)
				.setDescription(`There is no command named \`${commandName}\`!`)
			return interaction.reply({ embeds: [embed] });
		}

		delete require.cache[require.resolve(`../commands/${command.data.name}.js`)]

		try {
			const newCommand = require(`../commands/${command.data.name}.js`)
			interaction.client.commands.set(newCommand.data.name, newCommand)

			if (newCommand.onLoad) {
				newCommand.onLoad()
			}

			const embed = new EmbedBuilder()
				.setColor(MICKBOT_BLUE)
				.setDescription(`Command \`${newCommand.data.name}\` was reloaded!`)

			await interaction.reply({ embeds: [embed] })

			// Style command name white, bold, and italic
			print(`Command \x1B[37m\x1B[1m\x1B[3m${newCommand.data.name}\x1B[23m\x1B[22m\x1B[39m reloaded!`, 'magenta', '🔄')
		}
		catch (error) {
			console.error(error)

			const embed = new EmbedBuilder()
				.setColor(MICKBOT_RED)
				.setDescription(`There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``)
			await interaction.reply({ embeds: [embed] })
		}
	},
}
