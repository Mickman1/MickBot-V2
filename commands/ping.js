const { SlashCommandBuilder } = require('@discordjs/builders')

const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Get MickBot\'s Ping, Uptime, and other information'),
		
	async execute(interaction) {
		const embed = new MessageEmbed()
		
		let ping = interaction.client.ws.ping.toString()
		let totalServers = interaction.client.guilds.cache.size.toString()

		timeOnline = Math.floor(process.uptime() / 60)
		var timeOnlineMinutes = ' minutes'
		var timeOnlineHours = ' hours'

		if (timeOnline === 1)
			timeOnlineMinutes = ' minute'
		if (timeOnline === 60)
			timeOnlineHours = ' hour'

		embed.setTitle('MickBot Stats')
		embed.setColor(MICKBOT_BLUE)
		embed.addField('⏱ Ping', `\`${ping} ms\``, true)
		embed.addField('🕑 Uptime', `\`${(timeOnline < 60 ? (timeOnline + timeOnlineMinutes) : ((Number.isInteger(timeOnline / 60) ? (timeOnline / 60) : (timeOnline / 60).toFixed(2)) + timeOnlineHours))}\``, true)
		embed.addField('🖥️ Server Count', `\`${totalServers} servers\``, true)

		await interaction.reply({ embeds: [ embed ] })
	},
}