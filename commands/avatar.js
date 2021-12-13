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

		let mentionedUser
		let embedAvatarURL = interaction.user.avatarURL({ format: 'png', dynamic: true, size: 1024 })
		let embedUsername = interaction.member.nickname ? interaction.member.nickname : interaction.user.username

		if (interaction.options.data.length > 0) {
			mentionedUser = interaction.options.data[0]

			embedAvatarURL = mentionedUser.user.avatarURL({ format: 'png', dynamic: true, size: 1024 })

			embedUsername = mentionedUser.member.nickname ? mentionedUser.member.nickname : mentionedUser.user.username
		}

		embed.setImage(embedAvatarURL)
		embed.setTitle(embedUsername)
		embed.setColor(MICKBOT_BLUE)

		await interaction.reply({ embeds: [ embed ] })
	},
}