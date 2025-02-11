const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('random')
		.setDescription('Picks a random number between <min> and <max>')
		.addIntegerOption(option =>
			option.setName('min')
				.setDescription('The minimum number')
				.setRequired(true)
				.setMinValue(-100_000_000)
				.setMaxValue(100_000_000)
		)
		.addIntegerOption(option =>
			option.setName('max')
				.setDescription('The maximum number')
				.setRequired(true)
				.setMinValue(-100_000_000)
				.setMaxValue(100_000_000)
		)
		.setIntegrationTypes(0, 1)
		.setContexts(0, 1, 2),

	async execute(interaction) {
		// Get min and max values from interaction options
		const min = interaction.options.getInteger('min')
		const max = interaction.options.getInteger('max')

		const roll = await this.generateRoll(min, max)

		const embed = new EmbedBuilder()
			.setDescription(roll)
			.setColor(MICKBOT_BLUE)

		const rerollButton = new ButtonBuilder()
			.setCustomId('reroll')
			.setLabel('Re-Roll?')
			.setEmoji('🎲')
			.setStyle(ButtonStyle.Primary)

		const row = new ActionRowBuilder()
			.addComponents(rerollButton)

		const response = await interaction.reply({
			embeds: [embed],
			components: [row],
			withResponse: true,
		})

		const collectorFilter = i => i.user.id === interaction.user.id
		const collector = response.resource.message.createMessageComponentCollector({
			filter: collectorFilter, componentType: ComponentType.Button, time: 300_000,
		})
		collector.on('collect', async collectedInteraction => {
			const roll = await this.generateRoll(min, max)
			embed.setDescription(roll)
			collectedInteraction.reply({
				embeds: [embed],
			})
		})
	},

	async generateRoll(min, max) {
		let randomNum = Math.floor(Math.random() * (max - min + 1)) + min
		// Convert to string and add commas to final number with regex
		randomNum = randomNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

		return randomNum;
	},
}
