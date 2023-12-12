import fs from "fs";
import readline from "readline";
import { start } from "repl";

const filePath = "./input.txt";
const fileStream = fs.createReadStream(filePath);

const rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity,
});

// lineBuffer captures a state of 3 lines: before, current and after
// when init, it will being with 1 "null" for the "before" line
const lineBuffer = [null];
function addToLineBuffer(lineStr) {
	if (lineBuffer.length === 3) {
		// remove the first item
		lineBuffer.shift();
	}
	lineBuffer.push(lineStr);

	return lineBuffer.length;
}

function getIndexesToCheckForDigit(lineStr, index) {
	const maxLengthOfArray = lineStr.length;
	const filterValidIndex = (index) => index >= 0 && index < maxLengthOfArray;

	const adjacentIndex_surroundingLines = [index - 1, index, index + 1].filter(
		filterValidIndex
	);

	const adjacentIndex_currentLine = [index - 1, index + 1].filter(
		filterValidIndex
	);

	// the below is a bit wasteful, but it makes it easier to understand that we are comparing the 3 lines
	return [
		adjacentIndex_surroundingLines, // line before
		adjacentIndex_currentLine, // current line
		adjacentIndex_surroundingLines, // line after
	];
}

let sumofAllGearRatios = 0;

function processLine(lineStr) {
	addToLineBuffer(lineStr);
	if (lineBuffer.length !== 3) return false;

	const currentLineStr = lineBuffer[1];
	console.log(
		`Processing: \n${lineBuffer[0]}\n${lineBuffer[1]}\n${lineBuffer[2]}`
	);

	const re = /\*/g;
	let match;
	while ((match = re.exec(currentLineStr)) !== null) {
		const found = match[0];
		const position = match.index;

		console.log(`Found ${found} at ${position}.`);

		const allIndexesToCheck = getIndexesToCheckForDigit(
			currentLineStr,
			position
		);

		let partNumbersFingerprints = new Set();
		let partNumbersFound = [];

		outerLoop: for (let j = 0; j < allIndexesToCheck.length; j++) {
			const targetLineStr = lineBuffer[j];
			if (targetLineStr === null) continue;

			const indexesToCheck = allIndexesToCheck[j];

			for (let index of indexesToCheck) {
				const pattern = /[0-9]/;

				if (targetLineStr[index].match(pattern) !== null) {
					// found a digit!

					const re = /\d+/g;
					let match;
					while ((match = re.exec(targetLineStr)) !== null) {
						const found = match[0];
						const startIndex = match.index;
						const endIndex = re.lastIndex - 1;

						const fingerprint = `${targetLineStr}_${found}_${startIndex}_${endIndex}`; // TODO: crude way to make a fingerprint, can be optimised

						if (
							index >= startIndex &&
							index <= endIndex &&
							!partNumbersFingerprints.has(fingerprint)
						) {
							console.log(`Found adjacent number`, {
								found,
								startIndex,
								endIndex,
							});
							partNumbersFingerprints.add(fingerprint);
							partNumbersFound.push(parseInt(found));
						}
					}
				}
			}
		}

		if (partNumbersFound.length === 2) {
			const gearRatio = partNumbersFound.reduce((accumulator, item) => {
				return accumulator * item;
			}, 1);
			sumofAllGearRatios += gearRatio;
			console.log("Adjacent part numbers found", {
				partNumbersFound,
				gearRatio,
				sumofAllGearRatios,
			});
		}
	}
}

rl.on("line", (line) => {
	console.log(`Line from file: ${line}`);
	processLine(line);
});

rl.on("close", () => {
	console.log("Finished reading the file.");
	// at the end of the file, we will push in 1 more "null" line, so as to have complete lineBuffer for processing the last line of file
	processLine(null);
	console.log(sumofAllGearRatios);
});

// sumofAllGearRatios = 82824352
