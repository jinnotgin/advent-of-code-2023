import fs from "fs";
import readline from "readline";

const filePath = "./input.txt";
const fileStream = fs.createReadStream(filePath);

const rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity,
});

const cardsStrengthRank = [
	"J",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"T",
	"Q",
	"K",
	"A",
];
const handStrengthRank = [
	"HIGH_CARD",
	"ONE_PAIR",
	"TWO_PAIR",
	"THREE_OF_A_KIND",
	"FULL_HOUSE",
	"FOUR_OF_A_KIND",
	"FIVE_OF_A_KIND",
];

function countCardsInHand(handOfCards) {
	const cardCount = {};
	for (let card of handOfCards) {
		if (!Object.keys(cardCount).includes(card)) {
			cardCount[card] = 1;
		} else {
			cardCount[card] = cardCount[card] + 1;
		}
	}
	return cardCount;
}

function sortCardsByStrength_ascending(a, b) {
	return cardsStrengthRank.indexOf(a) - cardsStrengthRank.indexOf(b);
}

function getStrongestCard(cards = []) {
	const sorted = [...cards].sort(sortCardsByStrength_ascending);
	return sorted[sorted.length - 1];
}

function formBestHand(hand) {
	const handCount = hand.length;
	const handWithoutJokers = hand.replace(/J/g, "");
	const jokerCount = handCount - handWithoutJokers.length;

	// if no jokers
	if (jokerCount === 0) {
		return hand;
	}

	// check if hand is all jokers
	if (jokerCount === handCount) {
		// returns the most powerful five of a kind, ie AAAAA
		return cardsStrengthRank[cardsStrengthRank.length - 1].repeat(jokerCount);
	}

	const cardCount = countCardsInHand(handWithoutJokers);
	const uniqueCards = Object.keys(cardCount);

	// check if the hand has only 1 unique card
	if (uniqueCards.length === 1) {
		// make the hand a Five-of-a-kind
		return uniqueCards[0].repeat(handCount);
	}

	const ARE_ALL_SINGLES = uniqueCards.length === handWithoutJokers.length;
	const TWO_PAIR_ALREADY =
		handWithoutJokers.length === 4 &&
		Object.values(cardCount).every((x) => x === 2);

	if (ARE_ALL_SINGLES || TWO_PAIR_ALREADY) {
		// make it the strongest 2 Pair (if all Singles), or Full House (if have TWO_PAIR already)
		return `${handWithoutJokers}${getStrongestCard(uniqueCards).repeat(
			jokerCount
		)}`;
	}

	function getMostCommonCards(cardCount) {
		let highestCount = 0;
		let highestCountCards = [];
		Object.entries(cardCount).forEach(([card, count]) => {
			if (count > highestCount) {
				highestCount = count;
				highestCountCards = [card];
			} else if (count === highestCount) {
				highestCountCards.push(card);
			}
		});
		return highestCountCards;
	}

	// fallback scenario: make it the X-of-a-kind
	const mostCommonCards = getMostCommonCards(cardCount);
	return `${handWithoutJokers}${mostCommonCards[0].repeat(jokerCount)}`;
}

function evaluateHandStrength(handOfCards) {
	const cardCount = countCardsInHand(handOfCards);
	const uniqueCards = Object.keys(cardCount);

	let strength = "";
	switch (uniqueCards.length) {
		case 1:
			// Five of a Kind
			strength = "FIVE_OF_A_KIND";
			break;
		case 2:
			// Four of a Kind OR Full House
			if (Object.values(cardCount).includes(4)) {
				strength = "FOUR_OF_A_KIND";
			} else {
				strength = "FULL_HOUSE";
			}
			break;
		case 3:
			// Three of a Kind OR Two Pair
			if (Object.values(cardCount).includes(3)) {
				strength = "THREE_OF_A_KIND";
			} else {
				strength = "TWO_PAIR";
			}
			break;
		case 4:
			// One Pair
			strength = "ONE_PAIR";
			break;
		case 5:
			// High Card
			strength = "HIGH_CARD";
			break;
		default:
			break;
	}
	return strength;
}

function sortHandsByStrength_ascending(a, b) {
	if (a.strength === b.strength) {
		for (let i = 0; i < a.hand.length; i++) {
			const aCard = a.hand[i];
			const bCard = b.hand[i];

			if (aCard !== bCard) {
				return sortCardsByStrength_ascending(aCard, bCard);
			}
		}
	} else {
		return (
			handStrengthRank.indexOf(a.strength) -
			handStrengthRank.indexOf(b.strength)
		);
	}
}

const allHands = [];
rl.on("line", (line) => {
	console.log(`Line from file: ${line}`);
	const [handStr, bidStr] = line.split(" ");
	const bid = parseInt(bidStr);

	const strength = evaluateHandStrength(formBestHand(handStr));
	allHands.push({ hand: handStr, strength, bid });
});

rl.on("close", () => {
	console.log("Finished reading the file.");

	allHands.sort(sortHandsByStrength_ascending);
	console.log({ allHands });

	const totalWinnings = allHands.reduce((accumulator, item, index) => {
		const rank = index + 1;
		const { bid } = item;

		return accumulator + bid * rank;
	}, 0);
	console.log({ totalWinnings });
});

// { totalWinnings: 250757288 }
