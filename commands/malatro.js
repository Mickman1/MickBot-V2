const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

class Card {
	constructor({ rank, rankTitle, suit, emoji, color, chips, edition = null, enhancement = null, seal = null, disabled = false }) {
		this.rank = rank
		this.rankTitle = rankTitle
		this.suit = suit
		this.emoji = emoji
		this.color = color
		this.chips = chips
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
		.addSubcommand(subcommand =>
			subcommand
				.setName('start')
				.setDescription('Start a new Malatro game'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('end')
				.setDescription('End your current Malatro game'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('play')
				.setDescription('Play a hand'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('discard')
				.setDescription('Discard a hand'))
		.setIntegrationTypes(0, 1)
		.setContexts(0, 1, 2),

	async execute(interaction) {
		const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
		const CHIP_VALUES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11]
		const SUIT_NAMES = ['Spades', 'Hearts', 'Clubs', 'Diamonds']
		const SUIT_EMOJIS = ['♠️', '♥️', '♣️', '♦️']
		const SUIT_COLORS = ['blue', 'red', 'green', 'yellow']

		// Initialize deck and fill with default cards
		const deck = []
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 13; j++) {
				const card = new Card({
					rank: j + 2,
					rankTitle: RANKS[j],
					suit: SUIT_NAMES[i],
					emoji: SUIT_EMOJIS[i],
					color: SUIT_COLORS[i],
					chips: CHIP_VALUES[j],
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
			embedHand += `${hand[i].rankTitle}${hand[i].emoji} `
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
