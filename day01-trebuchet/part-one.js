import fs from "fs";
import readline from "readline";

const filePath = "./input.txt";

const fileStream = fs.createReadStream(filePath);

const rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity,
});

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
	sumOfCalibrationValues += getCalibrationValue(line);
});

rl.on("close", () => {
	console.log("Finished reading the file.");
	console.log(sumOfCalibrationValues);
});

// Part One: sumOfCalibrationValues = 54697
