import fs from "fs";
import readline from "readline";

const filePath = "./input.txt";
const fileStream = fs.createReadStream(filePath);

const rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity,
});

const data = {
	instruction: "",
	nodes: {},
};

let lineNumber = 0;
rl.on("line", (line) => {
	lineNumber++;
	console.log(`Line ${lineNumber} from file: ${line}`);

	if (lineNumber === 1) {
		data.instruction = line;
	} else if (lineNumber === 2) {
		return;
	} else {
		const [node, leftRightDestnations] = line.split(" = ");
		data.nodes[node] = [...leftRightDestnations.match(/\w{3}/g)];
	}
});

const START_NODE_LETTER = "A";
const END_NODE_LETTER = "Z";
const LEFT_RIGHT_MAP = ["L", "R"];

function findAllStartNodes() {
	return Object.keys(data.nodes).filter(
		(x) => x[x.length - 1] === START_NODE_LETTER
	);
}

function navigate(sourceNode, instructionIndex = 0, stepsTaken = 0) {
	const currentDirection = data.instruction[instructionIndex];
	const currentDirectionIndex = LEFT_RIGHT_MAP.indexOf(currentDirection);

	const sourceNode_directionData = data.nodes[sourceNode];

	const destinationNode = sourceNode_directionData[currentDirectionIndex];

	const currentSteps = stepsTaken + 1;
	if (destinationNode[destinationNode.length - 1] !== END_NODE_LETTER) {
		let next_instructionIndex = instructionIndex + 1;
		if (next_instructionIndex === data.instruction.length) {
			next_instructionIndex = 0;
		}

		const totalSteps = navigate(
			destinationNode,
			next_instructionIndex,
			currentSteps
		);
		return totalSteps;
	} else {
		return currentSteps;
	}
}

// This question is a bit cheating imo.
// If you run the code below, you will see that each startNode loops through the instructions set COMPLETELY (instructionLoops are whole numbers).
// This is very "rigged" data, and allows us to find the Lowest Common Mulitiple between all stepsTaken to see when they will sync up (end at Z node together.)
// If instructionLoops were not whole numbers, then things will be very different....
// I also had to google to get some tips for this question, so I'm a little salty hahaha

rl.on("close", () => {
	console.log("Finished reading the file.");
	console.log({ data });

	const instructionLength = data.instruction.length;
	const startNodes = findAllStartNodes();
	console.log({ instructionLength, startNodes });

	const totalSteps_startNodes = startNodes
		.map((x) => {
			return { startNode: x, stepsTaken: navigate(x) };
		})
		.map((item) => {
			return {
				...item,
				instructionLoops: item.stepsTaken / instructionLength,
			};
		});
	console.log({ totalSteps_startNodes });

	const totalSteps = lowestCommonMultiple_array(
		totalSteps_startNodes.map((x) => x.stepsTaken)
	);
	console.log({ totalSteps });
});

function greatestCommonDivisor(a, b) {
	/* 
  Example: Find the GCD of 48 and 18:
  48 ÷ 18 = 2 remainder 12. So, now compute GCD(18, 12).
  18 ÷ 12 = 1 remainder 6. So, now compute GCD(12, 6).
  12 ÷ 6 = 2 remainder 0. We have reached a remainder of 0, so 6 is the GCD.
 */

	// Ensure that a >= b
	if (a < b) {
		[a, b] = [b, a];
	}

	if (b === 0) {
		return a;
	} else {
		return greatestCommonDivisor(b, a % b);
	}
}

function lowestCommonMultiple(a, b) {
	return Math.abs(a * b) / greatestCommonDivisor(a, b);
}

function lowestCommonMultiple_array(numbers) {
	return numbers.reduce((acc, val) => lowestCommonMultiple(acc, val));
}

//   totalSteps:
