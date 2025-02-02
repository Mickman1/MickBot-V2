const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice')

const ytdl = require('@distube/ytdl-core')
const YouTube = require('youtube-sr').default
const { spotifyCredentials } = require('../config/config.json')
const SpotifyWebApi = require('spotify-web-api-node')

const spotifyApi = new SpotifyWebApi({
	clientId: spotifyCredentials.clientId,
	clientSecret: spotifyCredentials.clientSecret,
})

const mediaSources = new Map()
	.set('youtube', { color: '#FF0000' })
	.set('spotify', { color: '#1DB954' })

const functions = module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play audio using search terms or a URL')
		.addStringOption(option =>
			option.setName('input')
				.setDescription('Make a YouTube search or enter a YouTube/Spotify URL')
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

			const track = await getTrackFromInput(input)
			queue.songs.push({ url: track.url, color: track.color, origin: interaction })

			// If the state changed to 'idle' AND the queue's at the end by the time the youtubeSearch() function finishes, immediately start playing the requested song
			if (queue?.player?.state.status === 'idle' && queue.head + 2 === queue.songs.length) {
				queue.head += 1
				functions.play(queue)
				return;
			}

			const details = await ytdl.getBasicInfo(track.url)

			let embedDescription = details.videoDetails.description ? details.videoDetails.description : 'No description available'
			if (embedDescription.length > 500) {
				embedDescription = `${embedDescription.substring(0, 500)}...`
			}
			const embedViewCountFormatted = details.videoDetails.viewCount.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
			const embedChannelName = details.videoDetails.author.name.endsWith(' - Topic') ? details.videoDetails.author.name.slice(0, -7) : details.videoDetails.author.name
			const embedChannelIcon = details.videoDetails.author.thumbnails[details.videoDetails.author.thumbnails.length - 1].url
			const embedVideoThumbnail = details.videoDetails.thumbnails[details.videoDetails.thumbnails.length - 1].url

			const embed = new EmbedBuilder()
				.setColor(track.color)
				.setAuthor({
					name: '📃 Added to Queue:',
					iconURL: embedChannelIcon,
				})
				.setTitle(details.videoDetails.title)
				.setDescription(`${embedChannelName} • ${embedViewCountFormatted} views`)
				.setURL(details.videoDetails.video_url)
				.setThumbnail(embedVideoThumbnail)

			await interaction.editReply({ embeds: [embed] })
			return;
		}

		// If no queue started (no queue object, not in vc), then start from scratch
		// Make promises to connect to VC and search for first video
		queues.set(guildId, {
			head: 0,
			songs: [],
			volume: 0.5,
			loopModes: ['disabled', 'queue', 'single'],
			loopMode: 0,
			player: null,
			resource: null,
			connection: null,
		})

		queue = queues.get(guildId)

		// Make both Connection and Search promises, once both are fulfilled (bot is in VC & video result came back), then play
		const values = await Promise.all([makeConnectionPromise(interaction), makeSearchPromise(interaction)])

		queue.connection = values[0]
		const trackUrl = values[1].url
		const trackColor = values[1].color

		if (trackUrl === null) {
			const embed = new EmbedBuilder()
				.setColor(MICKBOT_RED)
				.setDescription('No search results found. Please try a different search term or link.')
			await interaction.editReply({ embeds: [embed] })

			queue.connection.destroy()
			queues.delete(guildId)
			return;
		}

		queue.songs.push({ url: trackUrl, color: trackColor, origin: interaction })

		functions.play(queue)
	},

	async play(queue) {
		const stream = ytdl(queue.songs[queue.head].url, {
			//filter: 'audioonly',
			quality: 'highestaudio',
			opusEncoded: true,
			highWaterMark: 1 << 28,
		})

		const player = createAudioPlayer()
		queue.player = player

		const resource = createAudioResource(stream, {
			bitrate: 128,
			highWaterMark: 128,
			inlineVolume: true,
		})
		queue.resource = resource
		resource.volume.setVolume(queue.volume)

		queue.connection.subscribe(player)
		player.play(resource)

		const details = await ytdl.getBasicInfo(queue.songs[queue.head].url)

		const embedViewCountFormatted = details.videoDetails.viewCount.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
		const embedChannelName = details.videoDetails.author.name.endsWith(' - Topic') ? details.videoDetails.author.name.slice(0, -7) : details.videoDetails.author.name
		const embedChannelIcon = details.videoDetails.author.thumbnails[details.videoDetails.author.thumbnails.length - 1].url
		const embedVideoThumbnail = details.videoDetails.thumbnails[details.videoDetails.thumbnails.length - 1].url

		const embed = new EmbedBuilder()
			.setColor(queue.songs[queue.head].color)
			.setAuthor({
				name: 'Now Playing:',
				iconURL: embedChannelIcon,
			})
			.setTitle(details.videoDetails.title)
			.setDescription(`${embedChannelName} • ${embedViewCountFormatted} views`)
			.setURL(queue.songs[queue.head].url)
			.setThumbnail(embedVideoThumbnail)

		try {
			await queue.songs[queue.head].origin.followUp({ embeds: [embed] })
		}

		catch {
			await queue.songs[queue.head].origin.channel.send({ embeds: [embed] })
		}

		player.once(AudioPlayerStatus.Idle, () => {
			print('The audio player has entered IDLE state!', 'white', '🔊')

			// If loopMode is 'single', start the same song over
			if (queue.loopMode === queue.loopModes[2]) {
				functions.play(queue)
				return;
			}

			// If not at the end of the queue, keep playing normally
			if (queue.head + 1 < queue.songs.length) {
				queue.head += 1

				functions.play(queue)
				return;
			}

			// If loopMode is 'queue', and at the end, start the queue over
			if (queue.loopMode === queue.loopModes[1]) {
				queue.head = 0

				functions.play(queue)
				return;
			}
		})
	},
	refreshSpotifyAccessToken: async function() {
		const spotifyAccessToken = await spotifyApi.clientCredentialsGrant()
		spotifyApi.setAccessToken(spotifyAccessToken.body.access_token)
		print('Spotify access token refreshed', 'green', '🔑')
	},
	onLoad: function() {
		// Refresh Spotify access token every 45 minutes
		functions.refreshSpotifyAccessToken()
		setInterval(() => {
			functions.refreshSpotifyAccessToken()
		}, 2_700_000)
	}
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
			const { guildId } = interaction
			const { queues } = interaction.client
			const queue = queues.get(guildId)

			queue.player?.stop()
			queues.delete(guildId)
		})
	});
}

// Promise to search YouTube using input from slash command options, and resolve when youtubeSearch() returns a video object
function makeSearchPromise(interaction) {
	return new Promise(resolve => {
		const input = interaction.options.get('input').value

		const track = getTrackFromInput(input)
		if (track === null) {
			resolve({ url: null, color: null })
		}
		resolve(track)
	});
}

async function getTrackFromInput(input) {
	const inputSource = getInputSource(input)

	// Check for search terms (null) first as it's most likely
	if (inputSource === null) {
		const youtubeUrl = await youtubeSearch(input)
		return { url: youtubeUrl, color: mediaSources.get('youtube').color };
	}

	// Valid YouTube links can be returned directly with no search required
	if (inputSource === mediaSources.get('youtube')) {
		return { url: input, color: mediaSources.get('youtube').color };
	}

	if (inputSource === mediaSources.get('spotify')) {
		const spotifyURL = new URL(input)

		let spotifyMediaType = spotifyURL.pathname.split('/')[1] // 'track', 'album', 'playlist'
		let spotifyId = spotifyURL.pathname.split('/')[2] // '35iLpqqQg4KrfYAzbvN1vH'

		if (spotifyMediaType !== 'track') {
			return { url: null, color: null };
		}
		if (spotifyId === undefined) {
			return { url: null, color: null };
		}

		let spotifyData = await spotifyApi.getTrack(spotifyId)
		let isrc = spotifyData.body.external_ids.isrc

		// Search YouTube for the ISRC of the Spotify track
		// If there's no ISRC value, search YouTube for the track title & artist name instead
		let youtubeUrl = await youtubeSearch(isrc)
		if (youtubeUrl === undefined) {
			youtubeUrl = await youtubeSearch(`${spotifyData.body.artists[0].name} ${spotifyData.body.name}`)
			return { url: youtubeUrl, color: mediaSources.get('youtube').color };
		}

		return { url: youtubeUrl, color: mediaSources.get('spotify').color };
	}
}

async function youtubeSearch(searchTerms) {
	return await YouTube.searchOne(searchTerms)
		.then(results => results.url)
		.catch(console.error)
}

function getInputSource(input) {
	if (isYoutubeUrl(input)) {
		return mediaSources.get('youtube');
	}

	if (isSpotifyUrl(input)) {
		return mediaSources.get('spotify');
	}

	return null;
}

function isYoutubeUrl(input) {
	const urlRegex = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/

	return !!String(input).match(urlRegex);
}

function isSpotifyUrl(input) {
	const urlRegex = /^(spotify:|https:\/\/[a-z]+\.spotify\.com\/)/

	return !!String(input).match(urlRegex);
}
