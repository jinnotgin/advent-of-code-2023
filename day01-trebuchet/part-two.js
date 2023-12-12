import fs from "fs";
import readline from "readline";

const filePath = "./input.txt";
const fileStream = fs.createReadStream(filePath);

const rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity,
});

const spelledDigits = {
	one: /(one)/g,
	two: /(two)/g,
	three: /(three)/g,
	four: /(four)/g,
	five: /(five)/g,
	six: /(six)/g,
	seven: /(seven)/g,
	eight: /(eight)/g,
	nine: /(nine)/g,
};
const spelledDigitsPattern = Object.values(spelledDigits);
const spelledDigitsTextPatternPair = Object.entries(spelledDigits);

function padSpelledDigits(str) {
	// some strings are like: 1eightwothree4. see how spelled digits are stuck together.
	// we want to seperate out the words, and we do by padding: repeating the first and last str of each digit
	// 1eightwothree4 => 1eeightttwootthreee4
	// this allows the replaceSpelledDigits function to work as intended

	for (let [text, pattern] of spelledDigitsTextPatternPair) {
		str = str.replace(pattern, `${text[0]}${text}${text[text.length - 1]}`);
	}
	return str;
}

function replaceSpelledDigits(str) {
	for (let i = 0; i < spelledDigitsPattern.length; i++) {
		const pattern = spelledDigitsPattern[i];
		const digitStr = `${i + 1}`;

		str = str.replace(pattern, digitStr);
	}
	return str;
}

function getCalibrationValue(str) {
	// On each line, the calibration value can be found by combining the first digit and the last digit (in that order) to form a single two-digit number.

	const pattern = /\d/g;

	const matches = str.match(pattern);
	if (!matches) {
		console.error(
			"getCalibrationValue: Unable to find any digits in input string"
		);
		return 0;
	}

	const firstDigit = matches[0];
	const lastDigit = matches[matches.length - 1];

	const calibrationValue = parseInt(`${firstDigit}${lastDigit}`);
	return calibrationValue;
}

let sumOfCalibrationValues = 0;
rl.on("line", (line) => {
	console.log(`Line from file: ${line}`);

	const correctedLine = replaceSpelledDigits(padSpelledDigits(line));
	console.log(`Corrected line: ${correctedLine}`);

	sumOfCalibrationValues += getCalibrationValue(correctedLine);
});

rl.on("close", () => {
	console.log("Finished reading the file.");
	console.log(sumOfCalibrationValues);
});

// Part Two: sumOfCalibrationValues = 54885
