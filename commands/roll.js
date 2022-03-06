const { SlashCommandBuilder } = require('@discordjs/builders')

const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Customizable dice-roller, good for D&D')
		.addIntegerOption(option =>
			option.setName('dice')
				.setDescription('Number of dice to roll')
				.setRequired(true)
		)
		.addIntegerOption(option =>
			option.setName('sides')
				.setDescription('Number of dice sides')
				.setRequired(true)
		),
		
	async execute(interaction) {
		const embed = new MessageEmbed()

		let dice = interaction.options.getInteger('dice')
		let sides = interaction.options.getInteger('sides')

		if (dice > 1000) {
			dice = 1000
		}
		// Roll the dice
		let total = 0
		let rolls = []
		for (let i = 0; i < dice; i++) {
			let roll = Math.floor(Math.random() * sides) + 1
			total += roll
			rolls.push(roll)
		}

		console.log(total)
		console.log(rolls)

		embed.setTitle(`Rolling ${interaction.options.getInteger('dice')}d${interaction.options.getInteger('sides')}...`)
		embed.setColor(MICKBOT_BLUE)


		await interaction.reply({ embeds: [ embed ] })
	},
}