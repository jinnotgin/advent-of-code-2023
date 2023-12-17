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
function insertColumn(columnData, insertionIndex) {
	const VALID_LENGTH = columnData.length === universe.length;
	if (!VALID_LENGTH) {
		throw new Error("columnData is not long enough to fit in universe");
	}
	const VALID_INSERTION_POINT =
		insertionIndex >= 0 && insertionIndex < universe[0].length;
	if (!VALID_INSERTION_POINT) {
		throw new Error("insertion point is out of bounds");
	}

	for (let i = 0; i < universe.length; i++) {
		const row = universe[i];
		row.splice(insertionIndex, 0, String(columnData[i]));
	}
}

function expandTheUniverse() {
	const hasNoGalaxies = (array) => array.every((x) => x === ".");

	for (let i = 0; i < universe.length; i++) {
		const row = universe[i];
		if (hasNoGalaxies(row)) {
			universe.splice(i, 0, [...row]);
			i++;
		}
	}

	for (let i = 0; i < universe[0].length; i++) {
		const column = getColumn(i);
		if (hasNoGalaxies(column)) {
			insertColumn([...column], i);
			i++;
		}
	}
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

function distanceBetweenGalaxyPair(index1, index2) {
	const [x1, y1] = galaxies[index1];
	const [x2, y2] = galaxies[index2];

	const distance = Math.abs(x2 - x1) + Math.abs(y2 - y1);
	return distance;
}

let galaxies = [];
rl.on("close", () => {
	console.log("Finished reading the file.");

	expandTheUniverse();

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
		galaxyPairings,
		sumOfShortestPathsBetweenGalaxyPairs,
	});
});

//  sumOfShortestPathsBetweenGalaxyPairs: 9623138
