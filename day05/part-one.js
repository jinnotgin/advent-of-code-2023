import fs from "fs";
import readline from "readline";

const filePath = "./input.txt";
const fileStream = fs.createReadStream(filePath);

const rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity,
});

const SEED = "seed";
const SOIL = "soil";
const FERTILIZER = "fertilizer";
const WATER = "water";
const LIGHT = "light";
const TEMPERATURE = "temperature";
const HUMIDITY = "humidity";
const LOCATION = "location";

const mappingOrder = [
	SEED,
	SOIL,
	FERTILIZER,
	WATER,
	LIGHT,
	TEMPERATURE,
	HUMIDITY,
	LOCATION,
];
const data = {};

let activeMap = null;
rl.on("line", (line) => {
	console.log(`Line from file: ${line}`);
	if (line === "") {
		activeMap = null;
		return;
	}

	if (activeMap !== null) {
		const [destinationRangeStart, sourceRangeStart, rangeLength] = line
			.split(" ")
			.map((item) => parseInt(item));

		data[activeMap].push({
			destinationRangeStart,
			sourceRangeStart,
			rangeLength,
		});
	}

	if (line.includes("seeds: ")) {
		data.seeds = [...line.match(/\d+/g).map((item) => parseInt(item))];
		return;
	}

	if (line.includes("map:")) {
		const mapStr = line.replace(" map:", "");

		data[mapStr] = [];
		activeMap = mapStr;
		return;
	}
});

rl.on("close", () => {
	console.log("Finished reading the file.");
	console.log(data);

	const lowestLocationNo = findAllSeedsLowestLocationNo();
	console.log({ lowestLocationNo });
});

function findDestination(sourceArea, destionationArea, sourceNo) {
	const mapKey = `${sourceArea}-to-${destionationArea}`;

	let destinationNo = null;

	for (let mappingData of data[mapKey]) {
		const { destinationRangeStart, sourceRangeStart, rangeLength } =
			mappingData;
		if (
			sourceNo >= sourceRangeStart &&
			sourceNo <= sourceRangeStart + rangeLength
		) {
			const diff = sourceNo - sourceRangeStart;
			destinationNo = destinationRangeStart + diff;
			break;
		}
	}

	if (destinationNo === null) destinationNo = sourceNo;

	return destinationNo;
}

function findLocation(seedNo) {
	let currentNo = seedNo; // begins with seed

	for (let i = 1; i < mappingOrder.length; i++) {
		const sourceArea = mappingOrder[i - 1];
		const destionationArea = mappingOrder[i];

		let destinationNo = findDestination(
			sourceArea,
			destionationArea,
			currentNo
		);
		console.log(
			`${sourceArea}: ${currentNo} => ${destionationArea}: ${destinationNo}`
		);

		currentNo = destinationNo;
	}

	return currentNo;
}

function findAllSeedsLowestLocationNo() {
	const locations = data.seeds.map((seedNo) => {
		console.log(`\nProcessing seed: ${seedNo}`);
		return findLocation(seedNo);
	});
	locations.sort((a, b) => a - b); // ascending sort
	console.log({ locations });

	return locations[0];
}

// { lowestLocationNo: 165788812 }
