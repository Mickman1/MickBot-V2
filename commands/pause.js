const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
//const { createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pause current track'),

	async execute(interaction) {
		const { guildId } = interaction
		const { queues } = interaction.client
		const queue = queues.get(guildId)

		queue.player.pause()

		const embed = new EmbedBuilder()
			.setColor(MICKBOT_BLUE)
			.setDescription('⏸️ Paused!')
		await interaction.reply({ embeds: [embed] })
	},
}
