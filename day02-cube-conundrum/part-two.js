import fs from "fs";
import readline from "readline";

const filePath = "./input.txt";
const fileStream = fs.createReadStream(filePath);

const rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity,
});

const cubesAvailable = {
	red: 12,
	green: 13,
	blue: 14,
};

function getGameId(str) {
	const pattern = /(?! )\d*(?=:)/;

	const matches = str.match(pattern);
	if (!matches) {
		console.error("getGameId: Unable to get game Id");
		return 0;
	}

	return parseInt(matches[0]);
}

function getKnownCubesPerGame(lineStr) {
	const game = lineStr.split(": ")[1];

	// challenge says that in each "set" of a Game, cubes are shown.
	// to avoid confusion with JavaScript set, i will call it "round" instead.
	const allRounds = game.split(";");

	const cubesKnown = {
		red: 0,
		green: 0,
		blue: 0,
	};
	for (let round of allRounds) {
		let allCubesShown = round.trim().split(",");

		for (let cubeTypeShown of allCubesShown) {
			const [countStr, cubeType] = cubeTypeShown.trim().split(" ");
			const count = parseInt(countStr);

			if (cubesKnown[cubeType] < count) {
				cubesKnown[cubeType] = count;
			}
		}
	}

	return cubesKnown;
}

function isGamePossible(cubesKnown) {
	for (let [cubeType, count] of Object.entries(cubesKnown)) {
		if (count > cubesAvailable[cubeType]) {
			return false;
		}
	}
	return true;
}

function getPowerOfCubesInEachGame(cubesKnown) {
	return Object.values(cubesKnown).reduce((accumulator, item) => {
		return accumulator * item;
	}, 1);
}

let sum_powersOfCubesInEachGame = 0;
rl.on("line", (line) => {
	console.log(`Line from file: ${line}`);

	const cubesKnown = getKnownCubesPerGame(line);
	sum_powersOfCubesInEachGame += getPowerOfCubesInEachGame(cubesKnown);
});

rl.on("close", () => {
	console.log("Finished reading the file.");
	console.log(sum_powersOfCubesInEachGame);
});

// Part Two: sum_powersOfCubesInEachGame = 72970
