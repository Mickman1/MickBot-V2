const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Sends your avatar, or the avatar of a mentioned user')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Who\'s avatar to send')
				.setRequired(false)
		),
		
	async execute(interaction) {
		const { MessageEmbed } = require('discord.js')
		const embed = new MessageEmbed()

		// "mentionedUser" is whoever's avatar to grab
		// If no mentioned user in the options, it's who sent the command
		let mentionedUser = interaction.user

		// Check if user gave an optional mentioned user
		if (interaction.options.data.length > 0) {
			mentionedUser = interaction.options.data[0].user
		}

		// Grab avatar URL. Prefer .png, but could return .gif
		let embedAvatarURL = mentionedUser.avatarURL({ format: 'png', dynamic: true, size: 1024 })
		// Set embed Title to mentionUser's nickname, if they have one
		let embedUsername = interaction.member.nickname ? interaction.member.nickname : mentionedUser.username

		// User colorthief to get dominant color of avatar for embed color
		const ColorThief = require('colorthief')
		let avatarColor = await ColorThief.getColor(embedAvatarURL)

		embed.setImage(embedAvatarURL)
		embed.setTitle(embedUsername)
		embed.setColor(avatarColor)

		interaction.reply({ embeds: [ embed ] })
	},
}