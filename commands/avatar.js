const { SlashCommandBuilder } = require('@discordjs/builders')

const { EmbedBuilder } = require('discord.js')
const ColorThief = require('colorthief')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Grab your avatar, or the avatar of a mentioned user')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Who\'s avatar to send')
				.setRequired(false)
		),
		
	async execute(interaction) {
		const embed = new EmbedBuilder()

		// "mentionedUser" is whoever's avatar to grab
		// If no mentioned user in the options, it's who sent the command
		let targetUser = interaction.user

		// Check if user gave an optional mentioned user
		if (interaction.options.data.length > 0) {
			targetUser = interaction.options.getUser('user')
		}

		// Grab avatar URL. Prefer .png, but could return .gif
		let embedAvatarURL = targetUser.avatarURL({ extension: 'png', size: 1024 })

		// If mentionedUser doesn't have an avatar set, use their default Discord avatar
		if (targetUser.avatar === null) {
			embedAvatarURL = targetUser.defaultAvatarURL
		}

		const avatarColor = await ColorThief.getColor(embedAvatarURL)

		embed.setAuthor({
			name: targetUser.username,
			url: `https://discord.com/users/${targetUser.id}`,
		})
		embed.setImage(embedAvatarURL)
		embed.setTitle(targetUser.displayName)
		embed.setColor(avatarColor)

		interaction.reply({ embeds: [embed] })
	},
}
