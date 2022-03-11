const { SlashCommandBuilder } = require('@discordjs/builders')

const { MessageEmbed } = require('discord.js')

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
				.addChoice('3D Full Body', 'body')
				.addChoice('3D Head', 'head')
				.addChoice('2D Full Body', 'player')
				.addChoice('2D Head', 'avatar')
				.addChoice('Skin File', 'skin')
		),
		
	async execute(interaction) {
		const embed = new MessageEmbed()

		const username = interaction.options.getString('username')
		let avatarType = 'body'
		// Check if user gave an optional avatar-type
		if (interaction.options.data.length > 1) {
			avatarType = interaction.options.getString('avatar-type')
		}

		embed.setImage(`https://mc-heads.net/${avatarType}/${username}/400.png`)
		embed.setAuthor({ name: 'Set as your skin?', iconURL: 'https://media.discordapp.net/attachments/596928630009888781/786054261787983913/grass.png', url: `https://mc-heads.net/change/${username}` })
		embed.setTitle(username)
		embed.setColor(MICKBOT_BLUE)

		await interaction.reply({ embeds: [ embed ] })
	},
}