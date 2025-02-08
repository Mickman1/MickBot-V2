const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Get MickBot\'s Ping, Uptime, and other information')
		.setIntegrationTypes(0, 1)
		.setContexts(0, 1, 2),

	async execute(interaction) {
		const embed = new EmbedBuilder()

		const ping = interaction.client.ws.ping.toString()
		const totalServers = interaction.client.guilds.cache.size.toString()

		timeOnline = Math.floor(process.uptime() / 60)
		var timeOnlineMinutes = ' minutes'
		var timeOnlineHours = ' hours'

		if (timeOnline === 1)
			timeOnlineMinutes = ' minute'
		if (timeOnline === 60)
			timeOnlineHours = ' hour'

		embed.setTitle('MickBot Stats')
		embed.setColor(MICKBOT_BLUE)
		embed.addFields(
			{ name: '⏱️ Ping', value: `\`${ping} ms\``, inline: true },
			{ name: '🕑 Uptime', value: `\`${(timeOnline < 60 ? (timeOnline + timeOnlineMinutes) : ((Number.isInteger(timeOnline / 60) ? (timeOnline / 60) : (timeOnline / 60).toFixed(2)) + timeOnlineHours))}\``, inline: true },
			{ name: '🖥️ Server Count', value: `\`${totalServers} servers\``, inline: true }
		)

		await interaction.reply({ embeds: [embed] })
	},
}
