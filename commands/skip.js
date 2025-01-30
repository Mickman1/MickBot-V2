const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
//const { createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip the current track'),

	async execute(interaction) {
		const { guildId } = interaction
		const { queues } = interaction.client
		const queue = queues.get(guildId)

		queue.player.stop()
		//queue.player.emit(AudioPlayerStatus.Idle)

		const embed = new EmbedBuilder()
			.setColor(MICKBOT_BLUE)
			.setDescription('⏩ Skipping!')
		await interaction.editReply({ embeds: [embed] })
		//await interaction.reply('Skipping!')
	},
}
