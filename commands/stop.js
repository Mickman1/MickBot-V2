const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
//const { createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stop playing music and leave Voice Channel'),

	async execute(interaction) {
		const { guildId } = interaction
		const { queues } = interaction.client
		const queue = queues.get(guildId)

		queue.player.stop()
		queue.connection.destroy()
		queues.delete(guildId)

		const embed = new EmbedBuilder()
			.setColor(MICKBOT_BLUE)
			.setDescription('⏹️ Stopped!')
		await interaction.reply({ embeds: [embed] })
	},
}
