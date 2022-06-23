const { SlashCommandBuilder } = require('@discordjs/builders')

const { createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice')
const ytdl = require('ytdl-core-discord')
const YouTube = require('youtube-sr').default
const fetch = require('node-fetch')
const { getData, getTracks } = require('spotify-url-info')(fetch)

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
			const input = interaction.options.get('input').value
		
			const url = await getUrlFromInput(input)
			queue.songs.push({ url, origin: interaction })

			// If the state changed to 'idle' AND the queue's at the end by the time the youtubeSearch() function finishes, immediately start playing the requested song
			if (queue?.player?.state.status === 'idle' && queue.head + 2 === queue.songs.length) {
				queue.head += 1
				functions.play(queue)
				return;
			}

			await interaction.editReply(`Added ${url} to queue!`)
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
				queue.connection = values[0]
				const url = values[1]

				queue.songs.push({ url, origin: interaction })

				functions.play(queue)
			})
	},

	async play(queue) {
		const { connection } = queue

		const stream = await ytdl(queue.songs[queue.head].url, {
			//filter: 'audioonly',
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

		queue.connection.subscribe(player)
		player.play(resource)

		const details = await ytdl.getBasicInfo(queue.songs[queue.head].url)
		
		try {
			await queue.songs[queue.head].origin.followUp(`Playing ${details.videoDetails.title}`)
		}
		
		catch {
			await queue.songs[queue.head].origin.channel.send(`Playing ${details.videoDetails.title}`)
		}

		player.once(AudioPlayerStatus.Idle, () => {
			console.log('The audio player has entered IDLE state!')

			if (queue.loopMode === 'single') {
				functions.play(queue)
				return;
			}

			// If not at the end of the queue, keep playing normally
			if (queue.head + 1 < queue.songs.length) {
				queue.head += 1
		
				functions.play(queue)
				return;
			}

			// If loopMode is 'queue', start the queue over
			if (queue.loopMode === 'queue') {
				queue.head = 0

				functions.play(queue)
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
		const input = interaction.options.get('input').value

		const url = getUrlFromInput(input)

		resolve(url)
	});
}

async function getUrlFromInput(input) {
	// Check if the input is already a valid YouTube URL, and just return that to skip the search
	if (isYoutubeURL(input)) {
		return input;
	}
	
	if (isSpotifyURL(input)) {
		let spotifyData = await getData(input)

		//! Temporary fix for Playlists
		if (spotifyData.type === 'playlist') {
			spotifyData = spotifyData.tracks.items[0].track

			//console.log(spotifyData)
		}

		if (spotifyData.type === 'album') {
			const allTracks = []
			for (let i = 0; i < spotifyData.tracks.items.length; i++) {
				const tempTrack = await getTracks(spotifyData.tracks.items[i].uri)
				allTracks.push(tempTrack)
			}

			//console.log(allTracks)
			spotifyData = allTracks[0]
		}

		// Search YouTube for the ISRC of the Spotify track
		// If there's no ISRC value, search YouTube for the track title instead
		let youtubeSearchTerms = spotifyData.name

		if (spotifyData.external_ids.isrc !== null) {
			youtubeSearchTerms = spotifyData.external_ids.isrc
		}

		let youtubeUrl = await youtubeSearch(youtubeSearchTerms)
		
		if (youtubeUrl === undefined) {
			youtubeUrl = await youtubeSearch(`${spotifyData.name} ${spotifyData.artists[0].name}`)
		}

		return youtubeUrl;
	}

	// If the input isn't a valid URL, use it as search terms
	const url = await youtubeSearch(input)
	return url;
}

async function youtubeSearch(searchTerms) {
	return await YouTube.searchOne(searchTerms)
		.then(results => results.url)
		.catch(console.error)
}

function isYoutubeURL(input) {
	const urlRegex = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/

	return !!String(input).match(urlRegex);
}

function isSpotifyURL(input) {
	const urlRegex = /(https?:\/\/(.+?\.)?spotify\.com(\/[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=]*)?)/

	return !!String(input).match(urlRegex);
}
