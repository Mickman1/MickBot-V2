const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const ColorThief = require('colorthief')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('banner')
		.setDescription('Grab your banner, or the banner of a mentioned user')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Grab another user\'s banner?')
				.setRequired(false)
		)
		.addStringOption(option =>
			option.setName('profile-type')
				.setDescription('User Profile or Server Profile? Only works in servers. (Default: User)')
				.setRequired(false)
				.addChoices(
					{ name: 'User Profile', value: 'user' },
					{ name: 'Server Profile', value: 'server' },
				)
		)
		.setIntegrationTypes(0, 1)
		.setContexts(0, 1, 2),

	async execute(interaction) {
		// If command was sent in Direct Messages
		if (interaction.context === 1 || interaction.context === 2) {
			this.dmBanner(interaction)
			return;
		}

		// Set targetUser to the Command sender by default
		// Then work out mentioned user and profile type
		let targetUser = interaction.member

		if (interaction.options.getUser('user')) {
			targetUser = interaction.options.getMember('user')
		}

		// If no selected profile type (default: user), or selected 'User Profile' option, targetUser becomes .user object
		if (!interaction.options.getString('profile-type') || interaction.options.getString('profile-type') === 'user') {
			const user = await targetUser.user.fetch()
			if (user.banner) {
				targetUser = user
			}
		}

		// Fallback to Server Profile if available
		if (!targetUser.banner) {
			targetUser = targetUser.user

			// If still nothing, error
			if (!targetUser.banner) {
				const embed = new EmbedBuilder()
					.setDescription('This user has no banner!')
					.setColor(MICKBOT_RED)

				interaction.reply({ embeds: [embed] })
				return;
			}
		}

		// Grab banner URL. Prefer .png, but could return .gif
		const embedBannerURL = await targetUser.bannerURL({ extension: 'webp', size: 4096 })

		const bannerColor = await ColorThief.getColor(embedBannerURL)

		const embed = new EmbedBuilder()
			.setAuthor({
				name: targetUser.username || targetUser.user.username,
				url: `https://discord.com/users/${targetUser.id}`,
			})
			.setImage(embedBannerURL)
			.setTitle(targetUser.displayName)
			.setColor(bannerColor)

		interaction.reply({ embeds: [embed] })
	},

	async dmBanner(interaction) {
		// Set targetUser to the Command sender by default
		// Then work out mentioned user and profile type
		let targetUser = await interaction.user.fetch()

		if (interaction.options.getUser('user')) {
			targetUser = await interaction.options.getUser('user').fetch()
		}

		if (!targetUser.banner) {
			let errorMessage = 'This user has no banner!'

			if (targetUser === interaction.user)
				errorMessage = 'You have no banner! 🫵'
			if (targetUser === interaction.client.user)
				errorMessage = 'I have no banner! 😔'

			const embed = new EmbedBuilder()
				.setDescription(errorMessage)
				.setColor(MICKBOT_RED)

			interaction.reply({ embeds: [embed] })
			return;
		}

		// Grab banner URL. Prefer .png, but could return .gif
		const embedBannerURL = await targetUser.bannerURL({ extension: 'webp', size: 4096 })

		const bannerColor = await ColorThief.getColor(embedBannerURL)

		const embed = new EmbedBuilder()
			.setAuthor({
				name: targetUser.username || targetUser.user.username,
				url: `https://discord.com/users/${targetUser.id}`,
			})
			.setImage(embedBannerURL)
			.setTitle(targetUser.displayName)
			.setColor(bannerColor)

		interaction.reply({ embeds: [embed] })
	},
}
