import fs from "fs";
import readline from "readline";

const filePath = "./input.txt";
const fileStream = fs.createReadStream(filePath);

const rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity,
});

const cardCopies = {}; // only track copies, not the original card
function addCopies(cardNo, matchesCount) {
	// if cardNo = 1, and then there are 4 matchesCount, then 2,3,4,5 will be given 1 copy
	for (let i = cardNo + 1; i <= cardNo + matchesCount; i++) {
		let currentCardNo_str = String(i);

		if (!Object.keys(cardCopies).includes(currentCardNo_str)) {
			cardCopies[currentCardNo_str] = 1;
		} else {
			cardCopies[currentCardNo_str] = cardCopies[currentCardNo_str] + 1;
		}
	}
}
function getCountOfCopies(cardNo) {
	let cardNoStr = String(cardNo);

	if (!Object.keys(cardCopies).includes(cardNoStr)) {
		return 0;
	} else {
		return cardCopies[cardNoStr];
	}
}

let sumOf_count_cardOriginalsAndCopies = 0;
function processCard(line) {
	const [cardStr, numbersStr] = line.split(":").map((item) => item.trim());
	const cardNo = parseInt(cardStr.match(/\d+/)[0]);

	const [winningStr, haveStr] = numbersStr
		.split("|")
		.map((item) => item.trim());

	const winning = new Set();
	winningStr.split(" ").forEach((item) => {
		winning.add(parseInt(item));
	});

	const numbersWonBefore = new Set();
	haveStr.split(" ").forEach((item) => {
		const number = parseInt(item);
		if (isNaN(number)) return;

		if (winning.has(number) && !numbersWonBefore.has(number)) {
			numbersWonBefore.add(number);
		}
	});
	console.log({ matches: numbersWonBefore.size });

	const count_cardOriginalsAndCopies = 1 + getCountOfCopies(cardNo);
	for (let i = 0; i < count_cardOriginalsAndCopies; i++) {
		addCopies(cardNo, numbersWonBefore.size);
	}

	sumOf_count_cardOriginalsAndCopies += count_cardOriginalsAndCopies;
}

rl.on("line", (line) => {
	console.log(`Line from file: ${line}`);
	processCard(line);
});

rl.on("close", () => {
	console.log("Finished reading the file.");
	console.log({ cardCopies, sumOf_count_cardOriginalsAndCopies });
});

// sumOf_count_cardOriginalsAndCopies = 5923918
