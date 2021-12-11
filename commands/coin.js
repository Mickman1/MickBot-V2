const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('coin')
		.setDescription('Flip a coin and see if you win!')
		.addStringOption(option =>
			option.setName('guess')
				.setDescription('Guess heads or tails')
				.setRequired(false)
				.addChoice('Heads', 'guess_heads')
				.addChoice('Tails', 'guess_tails')
		),
		
	async execute(interaction) {
		const { MessageEmbed } = require('discord.js')
		const embed = new MessageEmbed()

		let coinGIF = [
			'https://cdn.discordapp.com/attachments/596928630009888781/650328670724161547/CoinFlipHeadsFinal.gif',
			'https://cdn.discordapp.com/attachments/596928630009888781/779502238590566440/CoinFlipTailsFinal.gif'
		]

		let randomNum = Math.floor(Math.random() * 2)

		embed.setImage(coinGIF[randomNum])
		embed.setColor(MICKBOT_BLUE)

		await interaction.reply({ embeds: [embed] })

		setTimeout(() => {
			let coinOutcomeEmbedColor = MICKBOT_BLUE
			let guessOutcome = ''
			// Check if user gave an optional guess
			if (interaction.options.data.length > 0) {
				// Check if user's guess matches outcome, set embed color accordingly
				if ((interaction.options.data[0].value === 'guess_heads' && randomNum === 0) || (interaction.options.data[0].value === 'guess_tails' && randomNum === 1)) {
					guessOutcome = '\nYou guessed correctly!'
					coinOutcomeEmbedColor = MICKBOT_GREEN
				}
				else {
					guessOutcome = '\nYou guessed incorrectly!'
					coinOutcomeEmbedColor = MICKBOT_RED
				}
			}

			interaction.channel.send({ embeds: [ makeEmbed((randomNum === 0 ? '**Heads!**' : '**Tails!**') + guessOutcome, coinOutcomeEmbedColor) ] })
		}, 1900)
	},
}