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

		switch (queue.loopMode) {
			case 'disabled':
				queue.loopMode = 'queue'
				break
			case 'queue':
				queue.loopMode = 'single'
				break
			case 'single':
				queue.loopMode = 'disabled'
				break
		}

		await interaction.reply(`Changed loop mode to \`${queue.loopMode}\``)
	},
}
