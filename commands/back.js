const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
//const { createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice')
const { play } = require('./play.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('back')
		.setDescription('Go back one track'),

	async execute(interaction) {
		const { guildId } = interaction
		const { queues } = interaction.client
		const queue = queues.get(guildId)

		// If queue is at the end, /back should replay song at current queue head
		if (queue.player.state.status === 'idle') {
			await interaction.deferReply()
			play(queue, interaction)
			return;
		}

		// Default headMovement is 2, so the queue head moves back twice, to compensate for player.stop() iterating it once
		let headMovement = 2

		// Check if /back was used at the beginning of the queue, and only move head back once, so the current song starts over
		if (queue.head === 0) {
			headMovement = 1
		}

		// If somehow a user does /back too much, just return and don't change queue head
		else if (queue.head < 0) {
			print('Moving back too much!')
			return;
		}

		queue.head -= headMovement
		queue.player.stop()

		const embed = new EmbedBuilder()
			.setColor(MICKBOT_BLUE)
			.setDescription('⏮️ Moving Back!')
		await interaction.reply({ embeds: [embed] })
	},
}
