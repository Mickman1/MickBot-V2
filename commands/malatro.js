const {
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js')

const Card = require('../malatro/card')
const CARD_EMOTES = require('../malatro/cards')
const DECKS = require('../malatro/decks')
const JOKERS = require('../malatro/jokers')
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const RANKS_FULL = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace']
const CHIP_VALUES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11]
const SUIT_NAMES = ['Spades', 'Hearts', 'Clubs', 'Diamonds']
const SUIT_COLORS = ['blue', 'red', 'green', 'yellow']

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
				.setName('restart')
				.setDescription('Restart your current Malatro game'))
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
		switch (interaction.options.getSubcommand()) {
			case 'start':
				startGame(interaction)
				break
			case 'end':
				endGame(interaction)
				break
			case 'restart':
				restartGame(interaction)
				break
			case 'play':
				break
		}
	},

	async discardHand(interaction) {
		const game = interaction.client.malatroGames.get(interaction.user.id)

		// Sort selected cards highest to lowest to not affect currentHand indices
		game.selectedCards = game.selectedCards.toSorted((a, b) => b - a)

		for (let i = 0; i < game.selectedCards.length; i++) {
			game.currentHand.splice(game.selectedCards[i], 1)
		}

		const draw = drawCards(game.handSize - game.currentHand.length, game)

		for (let i = 0; i < draw.length; i++) {
			game.currentHand.push(draw[i])
		}

		displayHand(interaction, game)
	},

	async sortHandByRank(interaction) {
		const game = interaction.client.malatroGames.get(interaction.user.id)
		game.currentHand = game.currentHand.toSorted((a, b) => b.rank - a.rank)
		game.sortingMode = 0
		displayHand(interaction, game)
	},

	async sortHandBySuit(interaction) {
		const game = interaction.client.malatroGames.get(interaction.user.id)
		game.currentHand = game.currentHand.toSorted((a, b) => a.suitNumber - b.suitNumber)
		game.sortingMode = 1
		displayHand(interaction, game)
	},

	async selectCards(interaction) {
		const game = interaction.client.malatroGames.get(interaction.user.id)
		game.selectedCards = interaction.values

		//await interaction.deferReply()
	},
}

async function startGame(interaction) {
	const { malatroGames } = interaction.client

	if (malatroGames.get(interaction.user.id)) {
		const embed = new EmbedBuilder()
			.setDescription('There is already a Malatro game in session!')
			.setColor(MICKBOT_RED)
		await interaction.reply({ embeds: [embed] })
		return;
	}

	malatroGames.set(interaction.user.id, {
		jokers: [JOKERS.vagabond, JOKERS.blueprint, JOKERS.hangingChad, JOKERS.photograph, JOKERS.hologram],
		deck: [],
		deckType: DECKS.magic,
		remainingCards: [],
		currentHand: [],
		sortingMode: 0, // 0: Rank, 1: Suit
		hands: 4,
		discards: 3,
		handSize: 8,
		jokerSlots: 5,
		money: 4,
		vouchers: [],
		consumables: [],
		consumableSlots: 2,
		tarotCardsUsed: 0,
		hasFreeReroll: false,
		heldTags: [],
		ante: 1,
		round: 1,
		stake: 0,
		bossesEncountered: [],
		handTypes: {
			highCard: { level: 1, timesPlayed: 0 },
			pair: { level: 1, timesPlayed: 0 },
			twoPair: { level: 1, timesPlayed: 0 },
			threeOfAKind: { level: 1, timesPlayed: 0 },
			straight: { level: 1, timesPlayed: 0 },
			flush: { level: 1, timesPlayed: 0 },
			fullHouse: { level: 1, timesPlayed: 0 },
			fourOfAKind: { level: 1, timesPlayed: 0 },
			straightFlush: { level: 1, timesPlayed: 0 },
			fiveOfAKind: { level: 1, timesPlayed: 0 },
			flushHouse: { level: 1, timesPlayed: 0 },
			flushFive: { level: 1, timesPlayed: 0 },
		},
	})
	const game = malatroGames.get(interaction.user.id)

	// Initialize deck and fill with default cards
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 13; j++) {
			const card = new Card({
				rank: j + 2,
				rankTitle: RANKS[j],
				rankTitleFull: RANKS_FULL[j],
				suit: SUIT_NAMES[i],
				suitNumber: i,
				emote: CARD_EMOTES[i][j],
				color: SUIT_COLORS[i],
				chips: CHIP_VALUES[j],
				edition: null,
				enhancement: null,
				seal: null,
				debuffed: false,
			})
			game.deck.push(card)
		}
	}

	beginRound(interaction, game)
}

async function endGame(interaction) {
	const game = interaction.client.malatroGames.get(interaction.user.id)
	if (!game) {
		const embed = new EmbedBuilder()
			.setDescription('No game currently in progress!')
			.setColor('#A61A1F')
		await interaction.reply({ embeds: [embed] })
		return;
	}

	const embed = new EmbedBuilder()
		.setDescription('Game over!')
		.setColor('#A61A1F')
	await interaction.reply({ embeds: [embed] })

	interaction.client.malatroGames.delete(interaction.user.id)

	return;
}

async function restartGame(interaction) {
	const game = interaction.client.malatroGames.get(interaction.user.id)
	if (!game) {
		const embed = new EmbedBuilder()
			.setDescription('No game currently in progress!')
			.setColor('#A61A1F')
		await interaction.reply({ embeds: [embed] })
		return;
	}

	interaction.client.malatroGames.delete(interaction.user.id)

	startGame(interaction)
	return;
}

async function beginRound(interaction, game) {
	game.remainingCards = [...game.deck]
	shuffleCards(game.remainingCards)

	const hand = drawCards(8, game)
	game.currentHand = hand

	if (game.sortingMode === 0)
		game.currentHand = game.currentHand.toSorted((a, b) => b.rank - a.rank)
	if (game.sortingMode === 1)
		game.currentHand = game.currentHand.toSorted((a, b) => a.suitNumber - b.suitNumber)

	displayHand(interaction, game)
}

async function displayHand(interaction, game) {
	if (game.sortingMode === 0)
		game.currentHand = game.currentHand.toSorted((a, b) => b.rank - a.rank)
	if (game.sortingMode === 1)
		game.currentHand = game.currentHand.toSorted((a, b) => a.suitNumber - b.suitNumber)

	const hand = game.currentHand

	if (hand.length === 0) {
		endGame(interaction)
		return;
	}

	const jokerSlotDisplay = `\`${game.jokers.length}/${game.jokerSlots}\``
	let embedDescription = `# ${jokerSlotDisplay}`

	for (let i = 0; i < game.jokers.length; i++) {
		embedDescription += `${game.jokers[i].emote}`
	}

	let embedHand = `\`${hand.length}/${game.handSize}\` `
	for (let i = 0; i < hand.length; i++) {
		embedHand += `${hand[i].emote}`
	}

	const remainingCardsDisplay = `\`${game.remainingCards.length}/${game.deck.length}\``

	embedDescription += `\n# ${embedHand}  ${remainingCardsDisplay}${game.deckType.emote}`

	const embed = new EmbedBuilder()
		.setDescription(embedDescription)
		.setColor('#A61A1F')

	const cardSelectionOptions = []
	for (let i = 0; i < hand.length; i++) {
		const cardLabel = `${hand[i].rankTitleFull} of ${hand[i].suit}`
		cardSelectionOptions.push(new StringSelectMenuOptionBuilder()
			.setLabel(cardLabel)
			.setValue(i.toString())
			.setEmoji(hand[i].emote)
		)
	}

	const select = new StringSelectMenuBuilder()
		.setCustomId('handSelection')
		.setPlaceholder('Select cards')
		.setMinValues(1)
		.setMaxValues(hand.length > 5 ? 5 : hand.length)
		.addOptions(cardSelectionOptions)

	const selectRow = new ActionRowBuilder()
		.addComponents(select)

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

	const buttonRow = new ActionRowBuilder()
		.addComponents(play, rank, suit, discard)

	await interaction.reply({
		embeds: [embed],
		components: [selectRow, buttonRow],
	})
}

function drawCards(amount, game) {
	const dealtCards = []

	for (let i = 0; i < amount; i++) {
		if (game.remainingCards.length === 0) {
			console.log('No more cards!')
			break
		}

		dealtCards.push(game.remainingCards[0])
		game.remainingCards = game.remainingCards.slice(1)
	}

	return dealtCards;
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
