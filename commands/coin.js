const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('coin')
		.setDescription('Flip a coin and see if you win!'),
		
	async execute(interaction) {
		const { MessageEmbed } = require('discord.js')
		const embed = new MessageEmbed()

		let coinGIF = [
			'https://cdn.discordapp.com/attachments/596928630009888781/650328670724161547/CoinFlipHeadsFinal.gif',
			'https://cdn.discordapp.com/attachments/596928630009888781/779502238590566440/CoinFlipTailsFinal.gif'
		]
		
		let randomNum = Math.floor(Math.random() * 2)

		embed.setImage(coinGIF[randomNum])
		embed.setColor('#3498DB')

		await interaction.reply({ embeds: [embed] })
	},
}