const { SlashCommandBuilder } = require('@discordjs/builders')

const { MessageEmbed } = require('discord.js')
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
		const embed = new MessageEmbed()

		// "mentionedUser" is whoever's avatar to grab
		// If no mentioned user in the options, it's who sent the command
		let mentionedUser = interaction.user

		// Check if user gave an optional mentioned user
		if (interaction.options.data.length > 0) {
			mentionedUser = interaction.options.getUser('user')
		}

		// Grab avatar URL. Prefer .png, but could return .gif
		let embedAvatarURL = mentionedUser.avatarURL({ format: 'png', dynamic: true, size: 1024 })

		// If mentionedUser doesn't have an avatar set, use their default Discord avatar
		if (mentionedUser.avatar === null) {
			embedAvatarURL = mentionedUser.defaultAvatarURL
		}
		
		// Set embed Title to mentionUser's username
		const embedUsername = mentionedUser.username

		// Use colorthief to get dominant color of avatar for embed color
		const avatarColor = await ColorThief.getColor(embedAvatarURL)

		embed.setImage(embedAvatarURL)
		embed.setTitle(embedUsername)
		embed.setColor(avatarColor)

		interaction.reply({ embeds: [ embed ] })
	},
}