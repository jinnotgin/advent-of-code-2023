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
		const seedsData = line.match(/\d+/g).map((item) => parseInt(item));
		console.log({ seedsData });

		data.seedsRange = [];
		for (let i = 0; i < seedsData.length - 1; i = i + 2) {
			const start = seedsData[i];
			const rangeLength = seedsData[i + 1];

			data.seedsRange.push({
				start,
				rangeLength,
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

function accountForMappingBoundaries(
	sourceArea,
	destionationArea,
	initialStart,
	initialRangeLength
) {
	const initialEnd = initialStart + initialRangeLength - 1;
	const mapKey = `${sourceArea}-to-${destionationArea}`;

	const outputSet = new Set(); // using a set here to prevent duplicates
	function buildOutput(start, end) {
		outputSet.add(`${start}_${end}`);
	}

	for (let mappingData of data[mapKey]) {
		const mappingStart = mappingData.sourceRangeStart;
		const mappingRangeLength = mappingData.rangeLength;
		const mappingEnd = mappingStart + mappingRangeLength - 1;

		const INITIAL_SURROUNDS_MAPPING =
			initialStart < mappingStart && initialEnd > mappingEnd;
		const INITIAL_INTERSECTS_MAPPING_LEFT =
			initialStart < mappingStart && initialEnd >= mappingStart;
		const INITIAL_INTERSECTS_MAPPING_RIGHT =
			initialStart <= mappingEnd && initialEnd > mappingEnd;

		if (INITIAL_SURROUNDS_MAPPING) {
			buildOutput(initialStart, mappingStart - 1);
			buildOutput(mappingStart, mappingEnd);
			buildOutput(mappingEnd + 1, initialEnd);
		} else if (INITIAL_INTERSECTS_MAPPING_LEFT) {
			buildOutput(initialStart, mappingStart - 1);
			buildOutput(mappingStart, initialEnd);
		} else if (INITIAL_INTERSECTS_MAPPING_RIGHT) {
			buildOutput(initialStart, mappingEnd);
			buildOutput(mappingEnd + 1, initialEnd);
		}
	}
	if (outputSet.size === 0) {
		// not affected, ie intital does not intersect with mapping
		buildOutput(initialStart, initialEnd);
	}

	const output = [...outputSet].map((item) => {
		const [start, end] = item.split("_").map((x) => parseInt(x));
		return { start: start, rangeLength: end - start + 1 };
	});

	return output;
}

function findAllSeedsLowestLocationNo() {
	let current = data.seedsRange;

	for (let i = 1; i < mappingOrder.length; i++) {
		const sourceArea = mappingOrder[i - 1];
		const destionationArea = mappingOrder[i];

		const currentWithBoundaries = current
			.map(({ start, rangeLength }) => {
				return accountForMappingBoundaries(
					sourceArea,
					destionationArea,
					start,
					rangeLength
				);
			})
			.flat();

		const output = currentWithBoundaries.map(({ start, rangeLength }) => {
			let destinationNo = findDestination(sourceArea, destionationArea, start);
			return { start: destinationNo, rangeLength };
		});

		current = output;
	}
	const possibleLocations = current.map((x) => x.start);
	possibleLocations.sort((a, b) => a - b);

	return possibleLocations[0];
}

rl.on("close", () => {
	console.log("Finished reading the file.");
	// console.log(data);

	const lowestLocationNo = findAllSeedsLowestLocationNo();
	console.log({ lowestLocationNo });
});

// { lowestLocationNo: 1928058 }
