const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

const Card = require('../malatro/card')
const JOKERS = require('../malatro/jokers')

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
		const SUIT_EMOJIS = [
			'<:malatro_spade:1341718891486904372>',
			'<:malatro_heart:1341718883077455903>',
			'<:malatro_club:1341718903029760030>',
			'<:malatro_diamond:1341717371647168522>',
		]
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
					debuffed: false,
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

		const play = new ButtonBuilder()
			.setCustomId('play')
			.setLabel('Play')
			.setStyle(ButtonStyle.Primary)

		const discard = new ButtonBuilder()
			.setCustomId('discard')
			.setLabel('Discard')
			.setStyle(ButtonStyle.Danger)

		const rank = new ButtonBuilder()
			.setCustomId('rank')
			.setLabel('Rank')
			.setStyle(ButtonStyle.Secondary)

		const suit = new ButtonBuilder()
			.setCustomId('suit')
			.setLabel('Suit')
			.setStyle(ButtonStyle.Secondary)

		const row = new ActionRowBuilder()
			.addComponents(play, rank, suit, discard)

		const embed = new EmbedBuilder()
			.setDescription(`# ${embedHand}`)
			.setColor('#A61A1F')
		interaction.reply({
			embeds: [embed],
			components: [row],
		})

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

		function isStraight(hand) {
			if (hand.length !== 5)
				return false;

			const sortedHand = hand.toSorted((a, b) => a.rank - b.rank)

			for (let i = 0; i < 4; i ++) {
				if (sortedHand[i].rank !== sortedHand[i + 1].rank - 1)
					return false;
			}

			return true;
		}

		function isFiveOfAKind(hand) {
			if (hand.length !== 5)
				return false;

			const firstRank = hand[0].rank

			for (let i = 0; i < hand.length; i++) {
				if (firstRank !== hand[i].rank) {
					return false;
				}
			}
			return true;
		}

		function isFlush(hand) {
			if (hand.length !== 5)
				return false;

			const firstSuit = hand[0].suit

			for (let i = 0; i < hand.length; i++) {
				if (firstSuit !== hand[i].suit) {
					return false;
				}
			}
			return true;
		}

		function isFlushFive(hand) {
			if (hand.length !== 5)
				return false;

			const firstSuit = hand[0].suit
			const firstRank = hand[0].rank

			for (let i = 0; i < hand.length; i++) {
				if (firstSuit !== hand[i].suit) {
					return false;
				}
				if (firstRank !== hand[i].rank) {
					return false;
				}
			}
			return true;
		}
	},
}
