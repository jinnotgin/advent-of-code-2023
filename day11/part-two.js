import fs from "fs";
import readline from "readline";

const filePath = "./input.txt";
const fileStream = fs.createReadStream(filePath);

const rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity,
});

const universe = [];

rl.on("line", (line) => {
	// console.log(`Line from file: ${line}`);
	universe.push([...line]);
});

function getColumn(colNo, universeData = universe) {
	const output = [];
	for (let row of universeData) {
		output.push(row[colNo]);
	}
	return output;
}

function findExpansionPoints() {
	const hasNoGalaxies = (array) => array.every((x) => x === ".");

	const expansionPoints = {
		row: [],
		column: [],
	};
	for (let i = 0; i < universe.length; i++) {
		const row = universe[i];
		if (hasNoGalaxies(row)) {
			expansionPoints.row.push(i);
		}
	}

	for (let i = 0; i < universe[0].length; i++) {
		const column = getColumn(i);
		if (hasNoGalaxies(column)) {
			expansionPoints.column.push(i);
		}
	}

	return expansionPoints;
}

function getGalaxiesPositions() {
	const positions = [];
	for (let y = 0; y < universe.length; y++) {
		for (let x = 0; x < universe[y].length; x++) {
			if (universe[y][x] === "#") {
				positions.push([x, y]);
			}
		}
	}
	return positions;
}

function getUniquePairsIndex(array) {
	const pariingsIndex = [];
	for (let i = 0; i < array.length; i++) {
		for (let j = i + 1; j < array.length; j++) {
			pariingsIndex.push([i, j]);
		}
	}
	return pariingsIndex;
}

function expandedIndex(index, type) {
	if (type !== "row" && type !== "column") return new Error("Invalid type");

	let expandCounter = 0;
	for (let expansionIndex of expansionPoints[type]) {
		if (index >= expansionIndex) expandCounter++;
		else break;
	}

	return index + expandCounter * (EXPANSION_FACTOR - 1);
}

function distanceBetweenGalaxyPair(index1, index2) {
	const [x1, y1] = galaxies[index1];
	const [x2, y2] = galaxies[index2];

	const distance =
		Math.abs(expandedIndex(x2, "column") - expandedIndex(x1, "column")) +
		Math.abs(expandedIndex(y2, "row") - expandedIndex(y1, "row"));
	return distance;
}

const EXPANSION_FACTOR = 1000000;
let galaxies = [];
let expansionPoints;
rl.on("close", () => {
	console.log("Finished reading the file.");

	expansionPoints = findExpansionPoints();
	galaxies = getGalaxiesPositions();

	const galaxyPairings = getUniquePairsIndex(galaxies);

	const sumOfShortestPathsBetweenGalaxyPairs = galaxyPairings.reduce(
		(accumulator, [index1, index2]) => {
			return accumulator + distanceBetweenGalaxyPair(index1, index2);
		},
		0
	);

	console.log(universe.map((x) => x.join("")).join("\n"));
	console.log({
		galaxies,
		expansionPoints,
		galaxyPairings,
		sumOfShortestPathsBetweenGalaxyPairs,
	});
});

//   sumOfShortestPathsBetweenGalaxyPairs: 726820169514
