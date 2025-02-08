const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Customizable dice-roller, good for D&D')
		.addIntegerOption(option =>
			option.setName('dice')
				.setDescription('Number of dice to roll')
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(1000)
		)
		.addIntegerOption(option =>
			option.setName('sides')
				.setDescription('Number of dice sides')
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(1000)
		)
		.setIntegrationTypes(0, 1)
		.setContexts(0, 1, 2),

	async execute(interaction) {
		const embed = new EmbedBuilder()

		const dice = interaction.options.getInteger('dice')
		const sides = interaction.options.getInteger('sides')

		let total = 0
		const rolls = []
		for (let i = 0; i < dice; i++) {
			const roll = Math.floor(Math.random() * sides) + 1
			total += roll
			rolls.push(roll)
		}

		console.log(total)
		console.log(rolls)

		embed.setTitle(`Rolling ${interaction.options.getInteger('dice')}d${interaction.options.getInteger('sides')}...`)
		embed.setColor(MICKBOT_BLUE)

		const response = await interaction.reply({ embeds: [embed] })

		embed.setTitle(`Rolling ${interaction.options.getInteger('dice')}d${interaction.options.getInteger('sides')}...`)
		embed.addFields(
			{ name: 'Total', value: `**${total.toString()}**` },
			{ name: 'Rolls', value: `\`${rolls.join(', ')}\`` }
		)
		embed.setColor(MICKBOT_GREEN)
		await response.edit({ embeds: [embed] })
	},
}
