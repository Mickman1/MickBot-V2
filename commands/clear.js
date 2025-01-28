const { SlashCommandBuilder } = require('discord.js')
//const { createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Clear the current queue'),
		
	async execute(interaction) {
		const { guildId } = interaction
		const { queues } = interaction.client
		const queue = queues.get(guildId)

		const currentSong = queue.songs[queue.head]

		queue.songs = []
		queue.songs.push(currentSong)

		await interaction.reply('Queue cleared!')
	},
}
