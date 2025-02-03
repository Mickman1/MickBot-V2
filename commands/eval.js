const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js')
const { adminUserIds } = require('../config/config.json')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eval')
		.setDescription('Evaluate JavaScript')
		.addStringOption(option =>
			option.setName('expression')
				.setDescription('The expression to evaluate')
		),

	async execute(interaction) {
		if (!adminUserIds.includes(interaction.user.id)) {
			const embed = new EmbedBuilder()
				.setColor(MICKBOT_RED)
				.setDescription(`You don't have permissions to use this command!`)
			await interaction.reply({ embeds: [embed] })
			return;
		}

		if (interaction.options.data.length !== 0) {
			const expression = interaction.options.getString('expression')

			const evaluatedExpression = eval(expression)

			const inputEmbed = new EmbedBuilder()
				.setColor(MICKBOT_BLUE)
				.setTitle('Input:')
				.setDescription(`\`\`\`js\n${expression}\n\`\`\``)
			await interaction.reply({ embeds: [inputEmbed] })

			const outputEmbed = new EmbedBuilder()
				.setColor(MICKBOT_BLUE)
				.setTitle('Output:')
				.setDescription(`\`\`\`js\n${evaluatedExpression}\n\`\`\``)
			await interaction.followUp({ embeds: [outputEmbed] })
			return;
		}

		const modal = new ModalBuilder()
			.setCustomId('evalModal')
			.setTitle('Evaluate JavaScript')

		const evalInput = new TextInputBuilder()
			.setCustomId('evalInput')
			.setLabel('Enter JavaScript code')
			.setStyle(TextInputStyle.Paragraph)
			.setRequired(true)

		const actionRow = new ActionRowBuilder().addComponents(evalInput)

		modal.addComponents(actionRow)
		await interaction.showModal(modal)

		const filter = (interaction) => interaction.customId === 'evalModal'
		let modalInteraction = await interaction.awaitModalSubmit({ filter, time: 120_000 })

		const expression = modalInteraction.fields.getTextInputValue('evalInput')

		try {
			const evaluatedExpression = eval(expression)

			const inputEmbed = new EmbedBuilder()
				.setColor(MICKBOT_BLUE)
				.setTitle('Input:')
				.setDescription(`\`\`\`js\n${expression}\n\`\`\``)
			await modalInteraction.reply({ embeds: [inputEmbed] })

			const outputEmbed = new EmbedBuilder()
				.setColor(MICKBOT_BLUE)
				.setTitle('Output:')
				.setDescription(`\`\`\`js\n${evaluatedExpression}\n\`\`\``)
			await modalInteraction.followUp({ embeds: [outputEmbed] })
		}
		catch (error) {
			print('Eval error', 'red', '❗')
			console.log(error)

			const embed = new EmbedBuilder()
				.setColor(MICKBOT_RED)
				.setDescription('Eval error!')
			await modalInteraction.reply({ embeds: [embed] })
		}
	},
}
