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
	console.log(`Line from file: ${line}`);

	const animalX = line.indexOf("S");
	if (animalX !== -1) {
		animalPos = [animalX, yCount];
	}

	pipeMap.push([...line]);
	yCount++;
});

function getPipe(x, y) {
	// bigger x: move right
	// bigger y: move down
	return pipeMap[y][x];
}
function setPipe(value, x, y) {
	pipeMap[y][x] = value;
}

function setDistance(value, x, y) {
	distanceMap[y][x] = value;
}

const directionValues = {
	// x, y
	left: [-1, 0],
	right: [+1, 0],
	up: [0, -1],
	down: [0, +1],
};

function getPosInDirection(currentX, currentY, direction) {
	const [xChange, yChange] = directionValues[direction];

	return [currentX + xChange, currentY + yChange];
}

function getPipeInDirection(currentX, currentY, direction) {
	return getPipe(...getPosInDirection(currentX, currentY, direction));
}

const pipesThatConnect = {
	up: ["F", "7", "|"],
	down: ["L", "|", "J"],
	right: ["J", "-", "7"],
	left: ["L", "-", "F"],
};

function fixAnimalPos() {
	const [x, y] = animalPos;
	const up = getPipeInDirection(x, y, "up");
	const down = getPipeInDirection(x, y, "down");
	const left = getPipeInDirection(x, y, "left");
	const right = getPipeInDirection(x, y, "right");
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

	console.log("fixAnimalPos: fixed pipe is", { fixedPipe });
	setPipe(fixedPipe, x, y);
}

const pipeNextDirections = {
	F: ["right", "down"],
	"-": ["left", "right"],
	7: ["left", "down"],
	"|": ["up", "down"],
	J: ["up", "left"],
	L: ["up", "right"],
};

function nextPos(c_x, c_y, p_x = null, p_y = null) {
	// c = current, p = previous, n = next

	// console.log("nextPos: Received", { c_x, c_y, p_x, p_y });
	const c = getPipe(c_x, c_y);
	const [direction1, direction2] = pipeNextDirections[c];

	const n1_pos = getPosInDirection(c_x, c_y, direction1);
	const n2_pos = getPosInDirection(c_x, c_y, direction2);

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

	// console.log("travelInPipeLoop: received", {
	// 	c1_pos,
	// 	c2_pos,
	// 	c_distance,
	// 	p1_pos,
	// 	p2_pos,
	// });
	const n_distance = c_distance + 1;

	let n1_pos, n2_pos;
	if (c_distance === 0) {
		// just starting the maze
		[n1_pos, n2_pos] = nextPos(...c1_pos);
	} else {
		n1_pos = nextPos(...c1_pos, ...p1_pos);
		n2_pos = nextPos(...c2_pos, ...p2_pos);
	}

	// console.log("travelInPipeLoop: next positions are", { n1_pos, n2_pos });
	setDistance(n_distance, ...n1_pos);
	setDistance(n_distance, ...n2_pos);

	return { n_distance, n1_pos, n2_pos };
}

rl.on("close", () => {
	console.log("Finished reading the file.");
	// console.log({ map });
	console.log({ animalPos });

	distanceMap = pipeMap.map((xArray) => {
		return xArray.map((_) => null);
	});
	// console.log({ distanceMap });
	fixAnimalPos();

	// c = current, p = previous, n = next
	// pos = positions, which is an array of [x, y]
	let c1_pos = animalPos;
	let c2_pos = animalPos;
	let c_distance = 0;
	let p1_pos = null;
	let p2_pos = null;

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
			// console.log(
			// 	distanceMap
			// 		.map((xArray) => {
			// 			return xArray.map((node) => {
			// 				if (node === null) node = "";
			// 				return String(node).padStart(4);
			// 			});
			// 		})
			// 		.join("\n")
			// );
			console.log({ n_distance });
			break;
		}
	}
});

// { n_distance: 7173 }
