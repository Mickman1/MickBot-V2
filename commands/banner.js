const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const ColorThief = require('colorthief')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('banner')
		.setDescription('Grab your banner, or the banner of a mentioned user')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Who\'s banner to send')
				.setRequired(false)
		)
		.setIntegrationTypes(0, 1)
		.setContexts(0, 1, 2),

	async execute(interaction) {
		// "targetUser" is whoever's banner to grab
		// If no mentioned user in the options, it's who sent the command
		let targetUser = await interaction.user.fetch()

		// Check for optional mentioned user
		if (interaction.options.data.length > 0) {
			targetUser = await interaction.options.getUser('user').fetch()
		}

		if (targetUser.banner === null) {
			const embed = new EmbedBuilder()
				.setDescription('This user has no banner!')
				.setColor(MICKBOT_RED)

			interaction.reply({ embeds: [embed] })
			return;
		}

		// Grab banner URL. Prefer .png, but could return .gif
		const embedBannerURL = await targetUser.bannerURL({ extension: 'webp', size: 4096 })

		const bannerColor = await ColorThief.getColor(embedBannerURL)

		const embed = new EmbedBuilder()
			.setAuthor({
				name: targetUser.username,
				url: `https://discord.com/users/${targetUser.id}`,
			})
			.setImage(embedBannerURL)
			.setTitle(targetUser.displayName)
			.setColor(bannerColor)

		interaction.reply({ embeds: [embed] })
	},
}
