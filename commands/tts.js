const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tts')
		.setDescription('Generates Text-To-Speech for the given text!')
		.addStringOption(option =>
			option.setName('input')
				.setDescription('TTS input text')
				.setRequired(true)
		),
		
	async execute(interaction) {
		//var AWS = require('aws-sdk')

		let channel = interaction.member.channel
		const { joinVoiceChannel } = require('@discordjs/voice')

		const connection = joinVoiceChannel({
			channelId: channel.id,
			guildId: channel.guild.id,
			adapterCreator: channel.guild.voiceAdapterCreator,
		})

		console.log(connection)
		interaction.reply('pog')
	},
}