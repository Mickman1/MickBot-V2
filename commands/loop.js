const { SlashCommandBuilder } = require('discord.js')
//const { createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loop')
		.setDescription('Change loop mode (Queue, Single track, or Disabled)'),

	async execute(interaction) {
		const { guildId } = interaction
		const { queues } = interaction.client
		const queue = queues.get(guildId)

		// Cycle loopMode
		queue.loopMode = (queue.loopMode + 1) % 3

		await interaction.reply(`Changed loop mode to \`${queue.loopModes[queue.loopMode]}\``)
	},
}
