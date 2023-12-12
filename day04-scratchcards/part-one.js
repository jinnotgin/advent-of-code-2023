import fs from "fs";
import readline from "readline";

const filePath = "./input.txt";
const fileStream = fs.createReadStream(filePath);

const rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity,
});

function calculatePoints(line) {
	const numbersStr = line.split(":")[1].trim();

	const [winningStr, haveStr] = numbersStr
		.split("|")
		.map((item) => item.trim());

	const winning = new Set();
	winningStr.split(" ").forEach((item) => {
		winning.add(parseInt(item));
	});

	let points = 0;
	const numbersWonBefore = new Set();
	haveStr.split(" ").forEach((item) => {
		const number = parseInt(item);
		if (isNaN(number)) return;

		if (winning.has(number) && !numbersWonBefore.has(number)) {
			numbersWonBefore.add(number);
			if (points === 0) {
				points = 1;
			} else {
				points = points * 2;
			}
		}
	});

	return points;
}

let sumOfAllPoints = 0;
rl.on("line", (line) => {
	console.log(`Line from file: ${line}`);
	const points = calculatePoints(line);
	console.log({ points });

	sumOfAllPoints += points;
});

rl.on("close", () => {
	console.log("Finished reading the file.");
	console.log({ sumOfAllPoints });
});

// sumOfAllPoints = 23441
