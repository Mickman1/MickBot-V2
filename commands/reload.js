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
			return interaction.reply(`There is no command with name \`${commandName}\`!`);
		}

		delete require.cache[require.resolve(`../commands/${command.data.name}.js`)]

		try {
			const newCommand = require(`../commands/${command.data.name}.js`)
			interaction.client.commands.set(newCommand.data.name, newCommand)

			const embed = new EmbedBuilder()
				.setColor(MICKBOT_BLUE)
				.setDescription(`Command \`${newCommand.data.name}\` was reloaded!`)

			await interaction.reply({ embeds: [embed] })

			// Refresh Spotify access token every 45 minutes
			interaction.client.commands.get('play').refreshSpotifyAccessToken()
			setInterval(() => {
				interaction.client.commands.get('play').refreshSpotifyAccessToken()
			}, 2_700_000)
		}
		catch (error) {
			console.error(error)
			await interaction.reply(`There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``)
		}
	},
}
