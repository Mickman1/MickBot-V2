const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('random')
		.setDescription('Picks a random number between <min> and <max>')
		.addIntegerOption(option =>
			option.setName('min')
				.setDescription('The minimum number')
				.setRequired(true)
		)
		.addIntegerOption(option =>
			option.setName('max')
				.setDescription('The maximum number')
				.setRequired(true)
		),
		
	async execute(interaction) {
		/*const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')
		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('primary')
					.setLabel('Re-Roll?')
					.setStyle('PRIMARY'),
			)*/

		let min, max

		min = interaction.options.data[0].value

		if (interaction.options.data.length > 1) 
			max = interaction.options.data[1].value

		let randomNum = Math.floor(Math.random() * (max - min + 1)) + min
		// Convert to string and add commas to final number with regex
		randomNum = randomNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

		await interaction.reply({ embeds: [ makeEmbed(randomNum.toString(), MICKBOT_BLUE) ]/*, components: [row]*/ })
	},
}