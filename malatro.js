class Card {
	constructor({ rank, suit, edition = null, enhancement = null, seal = null, disabled = false }) {
		this.rank = rank
		this.suit = suit
		this.edition = edition
		this.enhancement = enhancement
		this.seal = seal
		this.disabled = disabled
	}
}

const SUITS = ['Spades', 'Hearts', 'Clubs', 'Diamonds']

// Initialize deck and fill with default cards
const deck = []
for (let i = 0; i < 4; i++) {
	for (let j = 2; j < 15; j++) {
		const card = new Card({
			rank: j,
			suit: SUITS[i],
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
