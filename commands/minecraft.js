const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('minecraft')
		.setDescription('Sends image of specified Minecraft skin')
		.addStringOption(option =>
			option.setName('username')
				.setDescription('Minecraft Java Edition username of skin')
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
		const { MessageEmbed } = require('discord.js')
		const embed = new MessageEmbed()

		let avatarType = 'body'
		// Check if user gave an optional avatar-type
		if (interaction.options.data.length > 1) {
			avatarType = interaction.options.data[1].value
		}

		embed.setImage(`https://mc-heads.net/${avatarType}/${interaction.options.data[0].value}/1000`)
		embed.setAuthor(interaction.options.data[0].value, 'https://media.discordapp.net/attachments/596928630009888781/786054261787983913/grass.png')
		embed.setColor(MICKBOT_BLUE)

		await interaction.reply({ embeds: [ embed ] })
	},
}