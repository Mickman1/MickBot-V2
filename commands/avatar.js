const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const ColorThief = require('colorthief')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Grab your avatar, or the avatar of a mentioned user')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Grab another user\'s avatar?')
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
			this.dmAvatar(interaction)
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
			if (user.avatar) {
				targetUser = user
			}
		}

		// Fallback to User Profile if available
		if (!targetUser.avatar) {
			targetUser = targetUser.user
		}

		// Grab avatar URL. Prefer .png, but could return .gif
		let embedAvatarURL = await targetUser.avatarURL({ extension: 'webp', size: 4096 })

		// If targetUser doesn't have an avatar set, use their default Discord avatar
		if (!targetUser.avatar) {
			embedAvatarURL = targetUser.defaultAvatarURL
		}

		const avatarColor = await ColorThief.getColor(embedAvatarURL)

		let embedUsername = targetUser.username
		if (targetUser.bot)
			embedUsername += `#${targetUser.discriminator}`

		const embed = new EmbedBuilder()
			.setAuthor({
				name: embedUsername || targetUser.user.username,
				url: `https://discord.com/users/${targetUser.id}`,
			})
			.setImage(embedAvatarURL)
			.setTitle(targetUser.displayName)
			.setColor(avatarColor)

		interaction.reply({ embeds: [embed] })
	},

	async dmAvatar(interaction) {
		// Set targetUser to the Command sender by default
		// Then work out mentioned user and profile type
		let targetUser = await interaction.user.fetch()

		if (interaction.options.getUser('user')) {
			targetUser = await interaction.options.getUser('user').fetch()
		}

		// Grab avatar URL. Prefer .png, but could return .gif
		let embedAvatarURL = await targetUser.avatarURL({ extension: 'webp', size: 4096 })

		// If targetUser doesn't have an avatar set, use their default Discord avatar
		if (!targetUser.avatar) {
			embedAvatarURL = targetUser.defaultAvatarURL
		}

		const avatarColor = await ColorThief.getColor(embedAvatarURL)

		let embedUsername = targetUser.username
		if (targetUser.bot)
			embedUsername += `#${targetUser.discriminator}`

		const embed = new EmbedBuilder()
			.setAuthor({
				name: embedUsername,
				url: `https://discord.com/users/${targetUser.id}`,
			})
			.setImage(embedAvatarURL)
			.setTitle(targetUser.displayName)
			.setColor(avatarColor)

		interaction.reply({ embeds: [embed] })
	},
}
