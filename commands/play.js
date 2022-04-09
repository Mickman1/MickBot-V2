const { SlashCommandBuilder } = require('@discordjs/builders')

const { createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice')
const ytdl = require('discord-ytdl-core')
const YouTube = require('youtube-sr').default

const functions = module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play music using search terms or a URL')
		.addStringOption(option =>
			option.setName('input')
				.setDescription('Search terms / Link')
				.setRequired(true)
		),
		
	async execute(interaction) {
		// Defer reply to let MickBot join voice channel, search video, etc.
		await interaction.deferReply()

		const { guildId } = interaction
		const { queues } = interaction.client
		let queue = queues.get(guildId)

		// If queue already started, it's either in a 'playing' state ('playing', 'buffering', 'paused', 'autoPaused') OR in 'idle' state
		// No matter the state, the searchTerms need to be converted to a url and put in queue.songs[]
		if (queue !== undefined) {
			const searchTerms = interaction.options.get('input').value
		
			const url = await youtubeSearch(searchTerms)
			queue.songs.push(url)

			// If the state changed to 'idle' AND the queue's at the end by the time the youtubeSearch() function finishes, immediately start playing the requested song
			if (queue?.player?.state.status === 'idle' && queue.head + 2 === queue.songs.length) {
				queue.head += 1
				functions.play(queue, interaction)
				return;
			}

			await interaction.editReply('Added to queue!')
			return;
		}

		// If no queue started (no queue object, not in vc), then start from scratch
		// Make promises to connect to VC and search for first video
		queues.set(guildId, {
			head: 0,
			songs: [],
			volume: 0.5,
			loopMode: 'disabled',
			player: null,
			resource: null,
			connection: null,
		})

		queue = queues.get(guildId)

		// Make both Connection and Search promises, once both are fulfilled (bot is in VC & video result came back), then play
		Promise.all([makeConnectionPromise(interaction), makeSearchPromise(interaction)])
			.then(async values => {
				const connection = values[0]
				queue.connection = connection
				const url = values[1]
				queue.songs.push(url)
				functions.play(queue, interaction)
			})
	},

	async play(queue, interaction) {
		const { connection } = queue

		const stream = ytdl(queue.songs[queue.head], {
			filter: 'audioonly',
			quality: 'highestaudio',
			opusEncoded: true,
			highWaterMark: 1 << 28,
			//encoderArgs: ['-af', 'dynaudnorm=f=200'],
		})

		const player = createAudioPlayer()
		queue.player = player

		const resource = createAudioResource(stream, {
			inputType: 'opus',
			bitrate: 128,
			highWaterMark: 128,
			inlineVolume: true,
		})
		queue.resource = resource
		resource.volume.setVolume(queue.volume)

		connection.subscribe(player)
		player.play(resource)

		await interaction.editReply('Playing')

		player.once(AudioPlayerStatus.Idle, () => {
			console.log('The audio player has entered IDLE state!')

			if (queue.loopMode === 'single') {
				functions.play(queue, interaction)
				return;
			}

			// If not at the end of the queue
			if (queue.head + 1 < queue.songs.length) {
				queue.head += 1
		
				functions.play(queue, interaction)
				return;
			}

			if (queue.loopMode === 'queue') {
				queue.head = 0

				functions.play(queue, interaction)
				return;
			}
		})
	},
}

// Promise to join voice channel, and resolve as soon as the 'Ready' state fires
function makeConnectionPromise(interaction) {
	return new Promise(resolve => {
		const connection = joinVoiceChannel({
			channelId: interaction.member.voice.channelId,
			guildId: interaction.guildId,
			adapterCreator: interaction.member.guild.voiceAdapterCreator,
		})

		connection.once(VoiceConnectionStatus.Ready, () => {
			resolve(connection)
		})

		connection.once(VoiceConnectionStatus.Disconnected, () => {
			console.log('Disconnected')

			const { guildId } = interaction
			const { queues } = interaction.client
			const queue = queues.get(guildId)

			queue.player?.stop()
			//queue.connection.destroy()
			queues.delete(guildId)
		})
	});
}

// Promise to search YouTube using input from slash command options, and resolve when youtubeSearch() returns a video object
function makeSearchPromise(interaction) {
	return new Promise(resolve => {
		const searchTerms = interaction.options.get('input').value

		const url = youtubeSearch(searchTerms)

		resolve(url)
	});
}

async function youtubeSearch(searchTerms) {
	// Check if the input (searchTerms) is already a valid YouTube URL, and just return that to skip the search
	if (isYoutubeURL(searchTerms)) {
		return searchTerms;
	}

	return await YouTube.searchOne(searchTerms)
		.then(results => results.url)
		.catch(console.error)
}

function isYoutubeURL(input) {
	const urlRegex = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/

	return !!String(input).match(urlRegex);
}
