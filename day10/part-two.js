// this method does not use Pick's Theorem, but instead uses a Flooding Algorithm that can travel between squeezed pipes

import fs from "fs";
import readline from "readline";

const filePath = "./input.txt";
const fileStream = fs.createReadStream(filePath);

const rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity,
});

const pipeMap = [];
let distanceMap = [];
let animalPos = [-1, -1];

let yCount = 0;
rl.on("line", (line) => {
	// console.log(`Line from file: ${line}`);

	const animalX = line.indexOf("S");
	if (animalX !== -1) {
		animalPos = [animalX, yCount];
	}

	pipeMap.push([...line]);
	yCount++;
});

function getPipe(pos) {
	// bigger x: move right
	// bigger y: move down
	const [x = false, y = false] = pos;
	try {
		return pipeMap[y][x];
	} catch (e) {
		// console.log("getPipe: Out of bounds!", { x, y });
		return false;
	}
}
function setPipe(value, pos) {
	const [x = false, y = false] = pos;
	if (Number.isInteger(x) && Number.isInteger(y)) {
		pipeMap[y][x] = value;
	}
}

function getDistance(pos) {
	const [x = false, y = false] = pos;
	try {
		return distanceMap[y][x];
	} catch (e) {
		// console.log("getDistance: Out of bounds!", { x, y });
		return false;
	}
}
function setDistance(value, pos) {
	const [x = false, y = false] = pos;
	if (Number.isInteger(x) && Number.isInteger(y)) {
		distanceMap[y][x] = value;
	}
}
function posHasNoDistance(pos) {
	return getDistance(pos) === null;
}

function getPipeIfInLoop(pos) {
	const pipe = getPipe(pos);
	if (posHasNoDistance(pos)) return false;
	else return pipe;
}

const directionValues = {
	// x, y
	left: [-1, 0],
	right: [+1, 0],
	up: [0, -1],
	down: [0, +1],
};

function applyDirectionToPos(pos, directions) {
	const [x = false, y = false] = pos;

	if (typeof directions === "string") {
		directions = [directions];
	}
	const yMax = distanceMap.length - 1;
	const xMax = distanceMap[0].length - 1;

	let newPos = [x, y];
	for (let direction of directions) {
		const [x, y] = newPos;
		const [xChange, yChange] = directionValues[direction];

		let newX = x + xChange;
		let newY = y + yChange;

		if (newX < 0 || newX > xMax || newY < 0 || newY > yMax) {
			return [false, false];
		}

		newPos = [newX, newY];
	}

	return newPos;
}

function isValidPos(pos) {
	const [x = false, y = false] = pos;
	return x !== false && y !== false;
}

function getPipeInDirection(pos, direction) {
	return getPipe(applyDirectionToPos(pos, direction));
}

const pipesThatConnect = {
	up: ["F", "7", "|"],
	down: ["L", "|", "J"],
	right: ["J", "-", "7"],
	left: ["L", "-", "F"],
};

function fixAnimalPos() {
	const up = getPipeInDirection(animalPos, "up");
	const down = getPipeInDirection(animalPos, "down");
	const left = getPipeInDirection(animalPos, "left");
	const right = getPipeInDirection(animalPos, "right");
	console.log("fixAnimalPos: neighouring pipes", { up, down, left, right });

	const CONNECTS_UP = pipesThatConnect["up"].includes(up);
	const CONNECTS_DOWN = pipesThatConnect["down"].includes(down);
	const CONNECTS_LEFT = pipesThatConnect["left"].includes(left);
	const CONNECTS_RIGHT = pipesThatConnect["right"].includes(right);

	let fixedPipe = null;
	if (CONNECTS_RIGHT && CONNECTS_DOWN) {
		fixedPipe = "F";
	} else if (CONNECTS_UP && CONNECTS_DOWN) {
		fixedPipe = "|";
	} else if (CONNECTS_UP && CONNECTS_RIGHT) {
		fixedPipe = "L";
	} else if (CONNECTS_LEFT && CONNECTS_RIGHT) {
		fixedPipe = "-";
	} else if (CONNECTS_LEFT && CONNECTS_UP) {
		fixedPipe = "J";
	} else if (CONNECTS_LEFT && CONNECTS_DOWN) {
		fixedPipe = "7";
	}
	if (fixedPipe === null) {
		throw new Error("fixAnimalPos: Unable to fix the pipe?!");
	}

	console.log("fixAnimalPos: fixed pipe is", { fixedPipe }, "\n");
	setPipe(fixedPipe, animalPos);
	setDistance(0, animalPos);
}

const pipeNextDirections = {
	".": [],
	F: ["right", "down"],
	"-": ["left", "right"],
	7: ["left", "down"],
	"|": ["up", "down"],
	J: ["up", "left"],
	L: ["up", "right"],
};

function nextPos(c_pos, p_pos = []) {
	// c = current, p = previous, n = next
	const [c_x = null, c_y = null] = c_pos;
	const [p_x = null, p_y = null] = p_pos;

	// console.log("nextPos: Received", { c_x, c_y, p_x, p_y });
	const c = getPipe(c_pos);
	const [direction1, direction2] = pipeNextDirections[c];

	const n1_pos = applyDirectionToPos(c_pos, direction1);
	const n2_pos = applyDirectionToPos(c_pos, direction2);

	if (p_x !== null && p_y !== null) {
		// console.log("nextPos: Evaluating between 2 possible next", {
		// 	n1_pos,
		// 	n2_pos,
		// 	p_x,
		// 	p_y,
		// });
		const nPos = [n1_pos, n2_pos].filter(([x, y]) => {
			return x !== p_x || y !== p_y;
		})[0];
		// console.log("nextPos: Given previous, the next is", { nPos });
		return nPos;
	} else {
		// console.log("nextPos: No previous, so the 2 possible next is", { n1_pos, n2_pos });
		return [n1_pos, n2_pos];
	}
}

function travelInPipeLoop(
	c1_pos,
	c2_pos,
	c_distance = 0,
	p1_pos = [],
	p2_pos = []
) {
	// c = current, p = previous, n = next
	const n_distance = c_distance + 1;

	let n1_pos, n2_pos;
	if (c_distance === 0) {
		// just starting the maze
		[n1_pos, n2_pos] = nextPos(c1_pos);
	} else {
		n1_pos = nextPos(c1_pos, p1_pos);
		n2_pos = nextPos(c2_pos, p2_pos);
	}

	// console.log("travelInPipeLoop: next positions are", { n1_pos, n2_pos });
	setDistance(n_distance, n1_pos);
	setDistance(n_distance, n2_pos);

	return { n_distance, n1_pos, n2_pos };
}

function getSqueezeGrid(pos, direction, squeezeSide) {
	if (!isValidPos(pos)) return false;

	let topLeft, topRight, bottomLeft, bottomRight;
	switch (direction) {
		case "up":
			if (squeezeSide === "left") {
				bottomRight = pos;
				bottomLeft = applyDirectionToPos(pos, "left");
			} else if (squeezeSide === "right") {
				bottomLeft = pos;
				bottomRight = applyDirectionToPos(pos, "right");
			}
			topLeft = applyDirectionToPos(bottomLeft, "up");
			topRight = applyDirectionToPos(bottomRight, "up");
			break;
		case "down":
			if (squeezeSide === "left") {
				topRight = pos;
				topLeft = applyDirectionToPos(pos, "left");
			} else if ((squeezeSide = "right")) {
				topLeft = pos;
				topRight = applyDirectionToPos(pos, "right");
			}
			bottomLeft = applyDirectionToPos(topLeft, "down");
			bottomRight = applyDirectionToPos(topRight, "down");
			break;
		case "left":
			if (squeezeSide === "up") {
				bottomRight = pos;
				topRight = applyDirectionToPos(pos, "up");
			} else if (squeezeSide === "down") {
				topRight = pos;
				bottomRight = applyDirectionToPos(pos, "down");
			}
			topLeft = applyDirectionToPos(topRight, "left");
			bottomLeft = applyDirectionToPos(bottomRight, "left");
			break;
		case "right":
			if (squeezeSide === "up") {
				bottomLeft = pos;
				topLeft = applyDirectionToPos(pos, "up");
			} else if (squeezeSide === "down") {
				topLeft = pos;
				bottomLeft = applyDirectionToPos(pos, "down");
			}
			topRight = applyDirectionToPos(topLeft, "right");
			bottomRight = applyDirectionToPos(bottomLeft, "right");
			break;
	}
	if (
		!isValidPos(topLeft) ||
		!isValidPos(topRight) ||
		!isValidPos(bottomLeft) ||
		!isValidPos(bottomRight)
	)
		return false;
	return [
		[topLeft, topRight],
		[bottomLeft, bottomRight],
	];
}

function applyDirectionToSqueezeGrid(grid, direction) {
	if (grid === false) return false;
	const [[topLeft, topRight], [bottomLeft, bottomRight]] = grid;

	const next = {
		topLeft: applyDirectionToPos(topLeft, direction),
		topRight: applyDirectionToPos(topRight, direction),
		bottomLeft: applyDirectionToPos(bottomLeft, direction),
		bottomRight: applyDirectionToPos(bottomRight, direction),
	};
	if (Object.values(next).some((x) => !isValidPos(x))) return false;

	return [
		[next.topLeft, next.topRight],
		[next.bottomLeft, next.bottomRight],
	];
}

function getNoDistancePosFromSqueezeGrid(grid, direction) {
	if (grid === false) return [];
	const [[topLeft, topRight], [bottomLeft, bottomRight]] = grid;

	let posTocheck = [];
	if (direction === "up") posTocheck = [topLeft, topRight];
	if (direction === "down") posTocheck = [bottomLeft, bottomRight];
	if (direction === "left") posTocheck = [topLeft, bottomLeft];
	if (direction === "right") posTocheck = [topRight, bottomRight];

	const posWithNoDistance = posTocheck.filter((pos) => posHasNoDistance(pos));
	return posWithNoDistance;
}

// squeezablePipes: direction, followed by which side
const squeezablePipes = {
	up: {
		left: ["J", "|", "7"],
		right: ["F", "|", "L"],
	},
	down: {
		// repeat of up
		left: ["J", "|", "7"],
		right: ["F", "|", "L"],
	},
	left: {
		up: ["L", "-", "J"],
		down: ["F", "-", "7"],
	},
	right: {
		// repeat of left
		up: ["L", "-", "J"],
		down: ["F", "-", "7"],
	},
};

function checkSqueezable(direction, pos1, pos2) {
	const squeezablePipesToCheck = Object.values(squeezablePipes[direction]);

	const POS1_CAN_SQUEEZE = squeezablePipesToCheck[0].includes(
		getPipeIfInLoop(pos1)
	);
	const POS2_CAN_SQUEEZE = squeezablePipesToCheck[1].includes(
		getPipeIfInLoop(pos2)
	);

	return POS1_CAN_SQUEEZE && POS2_CAN_SQUEEZE;
}

function nextDirectionsFromSqueezeGrid(grid, inertiaDirection) {
	if (grid === false) return [];
	const [[topLeft, topRight], [bottomLeft, bottomRight]] = grid;

	const inverseDirection = {
		up: "down",
		down: "up",
		left: "right",
		right: "left",
	};
	// if the grid is moving UP, we don't want it to move back DOWN
	const directionsToCheck = Object.keys(inverseDirection).filter(
		(x) => x !== inverseDirection[inertiaDirection]
	);

	const squeezableDirections = directionsToCheck.filter((direction) => {
		if (direction === "up")
			return checkSqueezable(direction, topLeft, topRight);
		if (direction === "down")
			return checkSqueezable(direction, bottomLeft, bottomRight);
		if (direction === "left")
			return checkSqueezable(direction, topLeft, bottomLeft);
		if (direction === "right")
			return checkSqueezable(direction, topRight, bottomRight);
	});

	return squeezableDirections;
}

function findStartingSqueezeGrids(pos, direction) {
	const allSqueezeSides = Object.keys(squeezablePipes[direction]);

	const viableSqueezeGrids = allSqueezeSides
		.map((squeezeSide) => getSqueezeGrid(pos, direction, squeezeSide))
		.filter(
			(squeezeGrid) =>
				nextDirectionsFromSqueezeGrid(squeezeGrid, direction).length > 0
		);

	return viableSqueezeGrids;
}

function travelBetweenSqueezedPipes(
	squeezeGrid,
	direction,
	posWithNoDistance = []
) {
	// this functions attempts teleport over the squeezed pipes, if any
	// if there are no squeezed pipes, then returns nothing (null)

	// const squeezeGrid = getSqueezeGrid(pos, direction, squeezeSide);

	const current_posWithNoDistance = getNoDistancePosFromSqueezeGrid(
		squeezeGrid,
		direction
	);
	posWithNoDistance.push(...current_posWithNoDistance);

	const nextDirections = nextDirectionsFromSqueezeGrid(squeezeGrid, direction);
	if (nextDirections.length === 0) {
		// console.log("travelBetweenSqueezedPipes: Unable to travel further", {
		// 	posWithNoDistance,
		// });
		return posWithNoDistance;
	}

	const nextSqueezeGrids = nextDirections.map((direction) =>
		applyDirectionToSqueezeGrid(squeezeGrid, direction)
	);

	return nextSqueezeGrids
		.map((grid, index) => {
			const direction = nextDirections[index];
			return travelBetweenSqueezedPipes(grid, direction, posWithNoDistance);
		})
		.flat();
}

function floodPos(pos) {
	// floods current position (with distance -1) if its null
	// returns an array of all possible next pos that can be flooded

	if (posHasNoDistance(pos) === false) {
		// is a pipe loop
		return [];
	}
	setDistance(-1, pos);

	const posWithNoDistance = new Set();

	// check for up, down, left, right
	["up", "down", "left", "right"].forEach((direction) => {
		const nextPos = applyDirectionToPos(pos, direction);
		if (!isValidPos(nextPos)) return;

		if (posHasNoDistance(nextPos)) {
			// next position is floodable
			posWithNoDistance.add(nextPos.join(","));
		} else {
			// try to look for viable squeeze spots
			const viableSqueezeGrids = findStartingSqueezeGrids(pos, direction); // when checking squeezeGrids, use pos

			for (let squeezeGrid of viableSqueezeGrids) {
				const current_posWithNoDistance = travelBetweenSqueezedPipes(
					squeezeGrid,
					direction
				);

				// console.log("floodPos: Travelled over squeezed pipes:", {
				// 	pos,
				// 	direction,
				// 	nextPos,
				// 	current_posWithNoDistance,
				// });
				current_posWithNoDistance.forEach((pos) =>
					posWithNoDistance.add(pos.join(","))
				);
			}
		}
	});

	// now, check for diagonals
	[
		["up", "left"],
		["up", "right"],
		["down", "left"],
		["down", "right"],
	].forEach((directions) => {
		const nextPos = applyDirectionToPos(pos, directions);
		if (!isValidPos(nextPos)) return;

		if (posHasNoDistance(nextPos)) {
			// next position is floodable
			posWithNoDistance.add(nextPos.join(","));
		}
	});

	return posWithNoDistance;
}

function getParameterPosToStartFlooding() {
	const yMax = distanceMap.length - 1;
	const xMax = distanceMap[0].length - 1;

	const allPos = [];
	for (let y = 0; y <= yMax; y++) {
		if (y === 0 || y === yMax) {
			for (let x = 0; x <= xMax; x++) {
				if (posHasNoDistance([x, y])) {
					allPos.push([x, y]);
				}
			}
		} else {
			for (let x of [0, xMax]) {
				if (posHasNoDistance([x, y])) {
					allPos.push([x, y]);
				}
			}
		}
	}
	return allPos;
}

rl.on("close", () => {
	console.log("Finished reading the file.\n");

	console.log({ animalPos });

	distanceMap = pipeMap.map((xArray) => {
		return xArray.map((_) => null);
	});
	fixAnimalPos();

	// c = current, p = previous, n = next
	// pos = positions, which is an array of [x, y]
	let c1_pos = animalPos;
	let c2_pos = animalPos;
	let c_distance = 0;
	let p1_pos = null;
	let p2_pos = null;

	console.log("Starting to travel in pipe loop");
	while (true) {
		const { n_distance, n1_pos, n2_pos } = travelInPipeLoop(
			c1_pos,
			c2_pos,
			c_distance,
			p1_pos,
			p2_pos
		);

		const FURTHEST_FROM_ANIMAL =
			c_distance !== 0 && n1_pos[0] === n2_pos[0] && n1_pos[1] === n2_pos[1];

		if (!FURTHEST_FROM_ANIMAL) {
			p1_pos = c1_pos;
			p2_pos = c2_pos;
			c1_pos = n1_pos;
			c2_pos = n2_pos;
			c_distance = n_distance;
		} else {
			console.log("Finished pipe loop!");
			console.log({ n_distance }, "\n");
			break;
		}
	}

	// using a Set here to prevent repeats. pos will be stored as strings as a result (x,y)
	let posToFlood = new Set(
		getParameterPosToStartFlooding().map((pos) => pos.join(","))
	);
	console.log("Begin flooding, starting from parameter");
	while (true) {
		const all_next_posToFlood = new Set();

		posToFlood.forEach((posStr) => {
			const pos = posStr.split(",").map((item) => parseInt(item));

			const next_posToFlood = floodPos(pos);

			next_posToFlood.forEach((posStr) => {
				all_next_posToFlood.add(posStr);
			});
		});

		if (all_next_posToFlood.size !== 0) {
			posToFlood = all_next_posToFlood;
		} else {
			console.log("Flooding complete!\n");
			break;
		}
	}

	console.log("Counting number of enclosed spots...");
	const countOfEnclosed = distanceMap.reduce((acc, xArray) => {
		return acc + xArray.filter((item) => item === null).length;
	}, 0);
	console.log({ countOfEnclosed });
	console.log("\n");

	console.log("[FLOOD MAP]");
	console.log(
		distanceMap
			.map((xArray, y) => {
				return xArray.reduce((acc, node, x) => {
					let output = getPipe([x, y]);
					if (node === null) output = "■";
					if (node === -1) output = "□";

					return `${acc}${output}`;
				}, "");
			})
			.join("\n")
	);
});

// { countOfEnclosed: 291 }
