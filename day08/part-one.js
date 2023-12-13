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

const START_NODE = "AAA";
const END_NODE = "ZZZ";
const LEFT_RIGHT_MAP = ["L", "R"];

function navigate(sourceNode, instructionIndex = 0, stepsTaken = 0) {
	const currentDirection = data.instruction[instructionIndex];
	const currentDirectionIndex = LEFT_RIGHT_MAP.indexOf(currentDirection);

	const sourceNode_directionData = data.nodes[sourceNode];

	const destinationNode = sourceNode_directionData[currentDirectionIndex];

	const currentSteps = stepsTaken + 1;
	if (destinationNode !== END_NODE) {
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

rl.on("close", () => {
	console.log("Finished reading the file.");
	console.log({ data });

	const totalSteps = navigate(START_NODE);
	console.log({ totalSteps });
});

//   totalSteps: 16271
