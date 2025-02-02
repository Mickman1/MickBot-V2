const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
//const { createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('volume')
		.setDescription('Show or change the current volume')
		.addIntegerOption(option =>
			option.setName('volume')
				.setDescription('Volume to use')
				.setRequired(false)
				.setMinValue(0)
				.setMaxValue(100)
		),

	async execute(interaction) {
		const { guildId } = interaction
		const { queues } = interaction.client
		const queue = queues.get(guildId)

		const currentVolume = queue.resource.volume.volume

		// If no volume is provided, reply with the current volume
		if (interaction.options.data.length === 0) {
			const formattedVolume = `${currentVolume * 100}%`

		const volumeEmoji = currentVolume > 0.5 ? '🔊' :  currentVolume === 0 ? '🔇' : '🔉'

			const embed = new EmbedBuilder()
				.setColor(MICKBOT_BLUE)
				.setDescription(`${volumeEmoji} Volume is \`${formattedVolume}\`!`)
			await interaction.reply({ embeds: [embed] })
			return;
		}

		// Format volume between 0 and 1 (ex: 100 -> 1, 47 -> 0.47)
		let newVolume = interaction.options.getInteger('volume') / 100

		// Set resource & queue volume
		queue.resource.volume.setVolume(newVolume)
		queue.volume = newVolume

		const volumeEmoji = newVolume > 0.5 ? '🔊' :  newVolume === 0 ? '🔇' : '🔉'

		const formattedVolume = `${newVolume * 100}%`

		const embed = new EmbedBuilder()
			.setColor(MICKBOT_BLUE)
			.setDescription(`${volumeEmoji} Volume is now \`${formattedVolume}\`!`)
		await interaction.reply({ embeds: [embed] })
	},
}
