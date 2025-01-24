const { SlashCommandBuilder } = require('@discordjs/builders')

const { EmbedBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('minecraft-skin')
		.setDescription('Grab a specific Minecraft skin')
		.addStringOption(option =>
			option.setName('username')
				.setDescription('Minecraft Java Edition skin username')
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('avatar-type')
				.setDescription('Avatar style for skin image (Default: 3D Full Body)')
				.setRequired(false)
				.addChoices(
					{ name: '3D Full Body', value: 'body'},
					{ name: '3D Head', value: 'head'},
					{ name: '2D Full Body', value: 'player'},
					{ name: '2D Head', value: 'avatar'},
					{ name: 'Skin File', value: 'skin'}
				)
		),
		
	async execute(interaction) {
		const embed = new EmbedBuilder()

		const username = interaction.options.getString('username')
		let avatarType = 'body'
		// Check if user gave an optional avatar-type
		if (interaction.options.data.length > 1) {
			avatarType = interaction.options.getString('avatar-type')
		}

		embed.setImage(`https://mc-heads.net/${avatarType}/${username}/400.png`)
		embed.setAuthor({
			name: 'Set as your skin?',
			iconURL: 'https://media.discordapp.net/attachments/596928630009888781/786054261787983913/grass.png',
			url: `https://mc-heads.net/change/${username}`,
		})
		embed.setTitle(username)
		embed.setColor(MICKBOT_BLUE)

		await interaction.reply({ embeds: [embed] })
	},
}
