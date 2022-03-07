const { SlashCommandBuilder } = require('@discordjs/builders')
const { createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice')
const ytdl = require('discord-ytdl-core')
const YouTube = require('youtube-sr').default

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play music using search terms or a URL!')
		.addStringOption(option =>
			option.setName('input')
				.setDescription('Search terms / Link')
				.setRequired(true)
		),
		
	async execute(interaction) {
		// Make both Connection and Search promises, once both are fulfilled (bot is in VC & video result came back), then play
		Promise.all([makeConnectionPromise(interaction), makeSearchPromise(interaction)]).then(async (values) => {
			const connection = values[0]
			const url = values[1]

			const stream = ytdl(url, {
				filter: 'audioonly',
				quality: 'highestaudio',
				opusEncoded: true,
				highWaterMark: 1 << 28,
				//encoderArgs: ['-af', 'dynaudnorm=f=200'],
			})

			const player = createAudioPlayer()

			const resource = createAudioResource(stream, {
				inputType: 'opus',
				bitrate: 128,
				highWaterMark: 128
			})

			connection.subscribe(player)
			player.play(resource)

			await interaction.reply('Playing')
		})
	}
}

// Promise to join voice channel, and resolve as soon as the 'Ready' state fires
function makeConnectionPromise(interaction) {
	return new Promise((resolve) => {
		const connection = joinVoiceChannel({
			channelId: interaction.member.voice.channelId,
			guildId: interaction.guildId,
			adapterCreator: interaction.member.guild.voiceAdapterCreator,
		})

		connection.on(VoiceConnectionStatus.Ready, () => {
			resolve(connection)
		})
	});
}

// Promise to search YouTube using input from slash command options, and resolve when youtubeSearch() returns a video object
function makeSearchPromise(interaction) {
	return new Promise(async (resolve) => {
		const searchTerms = interaction.options.get('input').value

		const url = await youtubeSearch(searchTerms)

		resolve(url)
	});
}

async function youtubeSearch(searchTerms) {
	return await YouTube.searchOne(searchTerms)
		.then(results => {
			return results.url;
		})
		.catch(console.error)
}