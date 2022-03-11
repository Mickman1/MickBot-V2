const { SlashCommandBuilder } = require('@discordjs/builders')

const { MessageEmbed } = require('discord.js')

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
		const embed = new MessageEmbed()

		const coinGIF = [
			'https://cdn.discordapp.com/attachments/596928630009888781/650328670724161547/CoinFlipHeadsFinal.gif',
			'https://cdn.discordapp.com/attachments/596928630009888781/779502238590566440/CoinFlipTailsFinal.gif',
		]

		const randomNum = Math.floor(Math.random() * 2)

		embed.setImage(coinGIF[randomNum])
		embed.setColor(MICKBOT_BLUE)

		await interaction.reply({ embeds: [embed] })

		let coinOutcomeEmbedColor = MICKBOT_BLUE
		let guessOutcome = ''
		// Check if user gave an optional guess
		if (interaction.options.data.length > 0) {
			// Check if user's guess matches outcome, set embed color accordingly
			if ((interaction.options.getString('guess') === 'guess_heads' && randomNum === 0) || (interaction.options.getString('guess') === 'guess_tails' && randomNum === 1)) {
				guessOutcome = '\nYou guessed correctly!'
				coinOutcomeEmbedColor = MICKBOT_GREEN
			}
			else {
				guessOutcome = '\nYou guessed incorrectly!'
				coinOutcomeEmbedColor = MICKBOT_RED
			}
		}

		// Wait until coin animation finishes before sending embed
		setTimeout(() => {
			interaction.channel.send({ embeds: [makeEmbed((randomNum === 0 ? '**Heads!**' : '**Tails!**') + guessOutcome, coinOutcomeEmbedColor)] })
		}, 1900)
	},
}
