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
		.setIntegrationTypes(0, 1)
		.setContexts(0, 1, 2),

	async execute(interaction) {
		// "targetUser" is whoever's avatar to grab
		// If no mentioned user in the options, it's who sent the command
		let targetUser = interaction.user

		// Check for optional mentioned user
		if (interaction.options.data.length > 0) {
			targetUser = interaction.options.getUser('user')
		}

		// Grab avatar URL. Prefer .png, but could return .gif
		let embedAvatarURL = targetUser.avatarURL({ extension: 'webp', size: 4096 })

		// If targetUser doesn't have an avatar set, use their default Discord avatar
		if (targetUser.avatar === null) {
			embedAvatarURL = targetUser.defaultAvatarURL
		}

		const avatarColor = await ColorThief.getColor(embedAvatarURL)

		const embed = new EmbedBuilder()
			.setAuthor({
				name: targetUser.username,
				url: `https://discord.com/users/${targetUser.id}`,
			})
			.setImage(embedAvatarURL)
			.setTitle(targetUser.displayName)
			.setColor(avatarColor)

		interaction.reply({ embeds: [embed] })
	},
}
