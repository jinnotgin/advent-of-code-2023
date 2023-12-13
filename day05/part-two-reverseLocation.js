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
const reverseMappingOrder = [...mappingOrder].reverse();

// As you can probably guess, we are gonna map in reverse, by guessing all possible locations from 0
// For each location, we check if the seed exists, rather than checking every seed one by one

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
		const seedsData = line.match(/\d+/g).map((item) => parseInt(item));
		console.log({ seedsData });

		data.seedsRange = [];
		for (let i = 0; i < seedsData.length - 1; i = i + 2) {
			const start = seedsData[i];
			const length = seedsData[i + 1];

			data.seedsRange.push({
				start,
				length,
			});
		}
		return;
	}

	if (line.includes("map:")) {
		const mapStr = line.replace(" map:", "");

		data[mapStr] = [];
		activeMap = mapStr;
		return;
	}
});

function findSource(destionationArea, sourceArea, destinationNo) {
	const mapKey = `${sourceArea}-to-${destionationArea}`;
	// console.log(mapKey);

	let sourceNo = null;

	for (let mappingData of data[mapKey]) {
		const { destinationRangeStart, sourceRangeStart, rangeLength } =
			mappingData;
		// console.log({ destinationRangeStart, sourceRangeStart, rangeLength });
		if (
			destinationNo >= destinationRangeStart &&
			destinationNo <= destinationRangeStart + rangeLength
		) {
			const diff = destinationNo - destinationRangeStart;
			sourceNo = sourceRangeStart + diff;
			break;
		}
	}

	if (sourceNo === null) sourceNo = destinationNo;

	return sourceNo;
}

function findSeed(locationNo) {
	let currentNo = locationNo; // begins with location

	for (let i = 1; i < reverseMappingOrder.length; i++) {
		const destionationArea = reverseMappingOrder[i - 1];
		const sourceArea = reverseMappingOrder[i];

		let sourceNo = findSource(destionationArea, sourceArea, currentNo);
		// console.log(
		// 	`${destionationArea}: ${currentNo} => ${sourceArea}: ${sourceNo}`
		// );

		currentNo = sourceNo;
	}

	return currentNo;
}

function doesSeedExist(seedNo) {
	let SEED_EXISTS = false;
	for (let { start, length } of data.seedsRange) {
		SEED_EXISTS = seedNo >= start && seedNo < start + length;
		if (SEED_EXISTS) break;
	}
	return SEED_EXISTS;
}

function findLowestLocationNo() {
	let location = 0;
	while (true) {
		// console.log(`\nProcesing location: ${location}`);
		const seedNo = findSeed(location);
		// console.log({ location, seedNo });

		const SEED_EXIST = doesSeedExist(seedNo);
		if (SEED_EXIST) {
			console.log("Seed exists!");
			return location;
		}
		location++;
	}
}

rl.on("close", () => {
	console.log("Finished reading the file.");
	console.log(data);

	const lowestLocationNo = findLowestLocationNo();

	console.log({ lowestLocationNo });
});

// { lowestLocationNo:  1928058}
