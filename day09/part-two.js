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

// function extrapolateNext(numbersArray) {
// 	const allDiffs = findDifferenceUntilZero(numbersArray);

// 	const nextNumber = [numbersArray, ...allDiffs]
// 		.map((x) => x[x.length - 1])
// 		.reduce((acc, item) => acc + item, 0);

// 	return nextNumber;
// }

function extrapolatePrevious(numbersArray) {
	const allDiffs = findDifferenceUntilZero(numbersArray);
	const combined = [numbersArray, ...allDiffs];

	function recursiveBack(allArrays, pastExtrapolate = 0) {
		if (allArrays.length === 0) {
			return pastExtrapolate;
		}
		const currentArray = allArrays.pop();
		pastExtrapolate = currentArray[0] - pastExtrapolate;

		return recursiveBack(allArrays, pastExtrapolate);
	}

	return recursiveBack(combined);
}

let sumOfExtrapolated = 0;
rl.on("line", (line) => {
	console.log(`Line from file: ${line}`);
	const numbersArray = line
		.trim()
		.split(" ")
		.map((x) => parseInt(x));

	sumOfExtrapolated += extrapolatePrevious(numbersArray);
});

rl.on("close", () => {
	console.log("Finished reading the file.");
	console.log({ sumOfExtrapolated });
});

// { sumOfExtrapolated: 990 }
