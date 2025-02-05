const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('trump-gone')
		.setDescription('How long until Trump is gone?'),

	async execute(interaction) {
		const startDate = new Date('January 20, 2025 12:00:00')
		const endDate = new Date('January 20, 2029 12:00:00')
		const nowDate = new Date()

		const totalSeconds = endDate - startDate
		const progressSeconds = nowDate - startDate
		const remainingSeconds = (totalSeconds - progressSeconds) / 1000

		const percentComplete = (progressSeconds / totalSeconds * 100).toFixed(4)

		const seconds = Math.floor(remainingSeconds % 60)
		const minutes = Math.floor((remainingSeconds / 60) % 60)
		const hours = Math.floor((remainingSeconds / (60 * 60)) % 24)
		const days = Math.floor(remainingSeconds / (60 * 60 * 24) % 365)
		const years = Math.floor(remainingSeconds / (60 * 60 * 24) / 365)

		const embed = new EmbedBuilder()
			.setColor('#E57C00')
			.setAuthor({
				name: '🕑 When is Trump gone?',
			})
			.setTitle(`There are *${years} years, ${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds* remaining.`)
			.setDescription(`Trump's presidency is \`${percentComplete}%\` over.`)

		interaction.reply({ embeds: [embed] })
	},
}
