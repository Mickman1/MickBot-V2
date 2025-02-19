const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

class Card {
	constructor({ rank, suit, emoji, color, edition = null, enhancement = null, seal = null, disabled = false }) {
		this.rank = rank
		this.suit = suit
		this.emoji = emoji
		this.color = color
		this.edition = edition
		this.enhancement = enhancement
		this.seal = seal
		this.disabled = disabled
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('malatro')
		.setDescription('Play Malatro!')
		.setIntegrationTypes(0, 1)
		.setContexts(0, 1, 2),

	async execute(interaction) {
		const SUIT_NAMES = ['Spades', 'Hearts', 'Clubs', 'Diamonds']
		const SUIT_EMOJIS = ['♠️', '♥️', '♣️', '♦️']
		const SUIT_COLORS = ['blue', 'red', 'green', 'yellow']

		// Initialize deck and fill with default cards
		const deck = []
		for (let i = 0; i < 4; i++) {
			for (let j = 2; j < 15; j++) {
				const card = new Card({
					rank: j,
					suit: SUIT_NAMES[i],
					emoji: SUIT_EMOJIS[i],
					color: SUIT_COLORS[i],
					edition: null,
					enhancement: null,
					seal: null,
					disabled: false,
				})
				deck.push(card)
			}
		}

		let remainingCards = [...deck]
		shuffleCards(remainingCards)

		const hand = drawCards(8)

		let embedHand = ''
		for (let i = 0; i < hand.length; i++) {
			embedHand += `${hand[i].rank}${hand[i].emoji} `
		}
		const embed = new EmbedBuilder()
			.setDescription(embedHand)
			.setColor(MICKBOT_BLUE)
		interaction.reply({ embeds: [embed] })

		function drawCards(amount) {
			const dealtCards = []

			for (let i = 0; i < amount; i++) {
				if (remainingCards.length === 0) {
					console.log('No more cards!')
					break
				}

				dealtCards.push(remainingCards[0])
				remainingCards = remainingCards.slice(1)
			}

			return dealtCards
		}

		function shuffleCards(cards) {
			for (let i = cards.length - 1; i >= 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[cards[i], cards[j]] = [cards[j], cards[i]]
			}
		}
	},
}
