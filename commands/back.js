const { SlashCommandBuilder } = require('@discordjs/builders')
//const { createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('back')
		.setDescription('Go back one track'),
		
	async execute(interaction) {
		const { guildId } = interaction
		const { queues } = interaction.client
		const queue = queues.get(guildId)

		// Default headMoveAmount is 2, so the queue head moves back twice,
		// to compensate for player.stop() iterating it once
		let headMoveAmount = 2

		// Check if /back was used at the beginning of the queue,
		// Only move head back once, so the current song starts over
		if (queue.head - 2 === -2) {
			headMoveAmount = 1
		}

		else if (queue.head - 2 < -2) {
			console.log('Moving back too much!')
			return;
		}
		
		queue.head -= headMoveAmount
		queue.player.stop()

		await interaction.reply('Going back!')
	},
}
