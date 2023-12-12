import fs from "fs";
import readline from "readline";

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

function getIndexesToCheckForSymbol(lineStr, startIndex, endIndex) {
	const currentArea = [];
	for (let i = startIndex; i <= endIndex; i++) {
		currentArea.push(i);
	}

	const maxLengthOfArray = lineStr.length;
	const filterValidIndex = (index) => index >= 0 && index < maxLengthOfArray;

	const adjacentIndex_surroundingLines = [
		startIndex - 1,
		...currentArea,
		endIndex + 1,
	].filter(filterValidIndex);

	const adjacentIndex_currentLine = [startIndex - 1, endIndex + 1].filter(
		filterValidIndex
	);

	// the below is a bit wasteful, but it makes it easier to understand that we are comparing the 3 lines
	return [
		adjacentIndex_surroundingLines, // line before
		adjacentIndex_currentLine, // current line
		adjacentIndex_surroundingLines, // line after
	];
}

let sumOfAllPartNumbers = 0;

function processLine(lineStr) {
	addToLineBuffer(lineStr);
	if (lineBuffer.length !== 3) return false;

	const currentLineStr = lineBuffer[1];
	console.log(`Processing ${currentLineStr}`);

	const re = /\d+/g;
	let match;
	while ((match = re.exec(currentLineStr)) !== null) {
		const found = match[0];
		const startIndex = match.index;
		const endIndex = re.lastIndex - 1;

		console.log(
			`Found ${found}. Starts at ${startIndex}, ends at ${endIndex}.`
		);

		const allIndexesToCheck = getIndexesToCheckForSymbol(
			currentLineStr,
			startIndex,
			endIndex
		);

		let symbolFound = false;

		outerLoop: for (let j = 0; j < allIndexesToCheck.length; j++) {
			const targetLineStr = lineBuffer[j];
			if (targetLineStr === null) continue;

			const indexesToCheck = allIndexesToCheck[j];

			for (let index of indexesToCheck) {
				const pattern = /[0-9.]/;

				if (targetLineStr[index].match(pattern) === null) {
					// found a symbol!
					symbolFound = true;
					console.log("Found a symbol!");
					break outerLoop;
				}
			}
		}

		if (symbolFound) {
			sumOfAllPartNumbers += parseInt(found);
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
	console.log(sumOfAllPartNumbers);
});

// sumOfAllPartNumbers = 556057
