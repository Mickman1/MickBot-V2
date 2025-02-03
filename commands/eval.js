const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { adminUserIds } = require('../config/config.json')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eval')
		.setDescription('Evaluate JavaScript')
		.addStringOption(option =>
			option.setName('expression')
				.setDescription('The expression to evaluate')
				.setRequired(true)
		),

	async execute(interaction) {
		if (!adminUserIds.includes(interaction.user.id)) {
			const embed = new EmbedBuilder()
				.setColor(MICKBOT_RED)
				.setDescription(`You don't have permissions to use this command!`)
			await interaction.reply({ embeds: [embed] })
			return;
		}

		const expression = interaction.options.getString('expression')

		try {
			const evaluatedExpression = eval(expression)

			const embed = new EmbedBuilder()
				.setColor(MICKBOT_BLUE)
				.setDescription(`\`\`\`js\n${evaluatedExpression}\n\`\`\``)
			await interaction.reply({ embeds: [embed] })
		}
		catch (error) {
			print('Eval error', 'red', '❗')
			console.log(error)

			const embed = new EmbedBuilder()
				.setColor(MICKBOT_RED)
				.setDescription('Eval error!')
			await interaction.reply({ embeds: [embed] })
		}
	},
}
