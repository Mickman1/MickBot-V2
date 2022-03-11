const { SlashCommandBuilder } = require('@discordjs/builders')
//const { createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip current track'),
		
	async execute(interaction) {
		const { guildId } = interaction
		const { queues } = interaction.client
		const queue = queues.get(guildId)

		queue.player.stop()
		//queue.player.emit(AudioPlayerStatus.Idle)

		await interaction.reply('Skipping!')
	},
}
