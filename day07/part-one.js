import fs from "fs";
import readline from "readline";

const filePath = "./input.txt";
const fileStream = fs.createReadStream(filePath);

const rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity,
});

const cardsStrengthRank = [
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"T",
	"J",
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

function evaluateHandStrength(handOfCards) {
	const cardCount = {};
	for (let card of handOfCards) {
		if (!Object.keys(cardCount).includes(card)) {
			cardCount[card] = 1;
		} else {
			cardCount[card] = cardCount[card] + 1;
		}
	}

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
				return (
					cardsStrengthRank.indexOf(aCard) - cardsStrengthRank.indexOf(bCard)
				);
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

	const strength = evaluateHandStrength(handStr);
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

// { totalWinnings: 251287184 }
