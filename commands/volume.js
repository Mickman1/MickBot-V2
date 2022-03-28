const { SlashCommandBuilder } = require('@discordjs/builders')
//const { createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('volume')
		.setDescription('Show or change the current volume')
		.addIntegerOption(option =>
			option.setName('volume')
				.setDescription('Volume to use')
				.setRequired(false)
		),
		
	async execute(interaction) {
		const { guildId } = interaction
		const { queues } = interaction.client
		const queue = queues.get(guildId)

		const currentVolume = queue.resource.volume.volume

		// If user supplied a new volume value
		if (interaction.options.data.length > 0) {
			// Format volume between 0 and 1 (ex: 100 -> 1, 47 -> 0.47)
			let newVolume = interaction.options.getInteger('volume') / 100

			// Set upper and lower limits for max and min volume
			if (newVolume > 1) {
				newVolume = 1
			}

			if (newVolume < 0) {
				newVolume = 0
			}

			// Set resource / prism-media volume, and update the queue object's volume to set the temporary default
			queue.resource.volume.setVolume(newVolume)
			queue.volume = newVolume

			const formattedVolume = `${newVolume * 100}%`
			return await interaction.reply(`Volume changed to \`${formattedVolume}\`!`);
		}

		const formattedVolume = `${currentVolume * 100}%`
		await interaction.reply(`Volume is \`${formattedVolume}\`!`)
	},
}
