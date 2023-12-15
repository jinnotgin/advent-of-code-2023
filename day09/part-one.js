import fs from "fs";
import readline from "readline";

const filePath = "./input.txt";
const fileStream = fs.createReadStream(filePath);

const rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity,
});

function findDifference(numbersArray) {
	const diff = [];
	for (let i = 1; i < numbersArray.length; i++) {
		diff.push(numbersArray[i] - numbersArray[i - 1]);
	}
	return diff;
}

function findDifferenceUntilZero(numbersArray, diffs = []) {
	const diffArray = findDifference(numbersArray);
	diffs.push(diffArray);

	if (!diffArray.every((x) => x === 0)) {
		diffs = findDifferenceUntilZero(diffArray, diffs);
	}

	return diffs;
}

function extrapolateNext(numbersArray) {
	const allDiffs = findDifferenceUntilZero(numbersArray);

	const nextNumber = [numbersArray, ...allDiffs]
		.map((x) => x[x.length - 1])
		.reduce((acc, item) => acc + item, 0);

	return nextNumber;
}

let sumOfExtrapolated = 0;
rl.on("line", (line) => {
	console.log(`Line from file: ${line}`);
	const numbersArray = line
		.trim()
		.split(" ")
		.map((x) => parseInt(x));

	sumOfExtrapolated += extrapolateNext(numbersArray);
});

rl.on("close", () => {
	console.log("Finished reading the file.");
	console.log({ sumOfExtrapolated });
});

// { sumOfExtrapolated: 1887980197 }
