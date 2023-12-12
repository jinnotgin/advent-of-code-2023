import fs from "fs";
import readline from "readline";

const filePath = "./input.txt";
const fileStream = fs.createReadStream(filePath);

const rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity,
});

rl.on("line", (line) => {
	console.log(`Line from file: ${line}`);
});

rl.on("close", () => {
	console.log("Finished reading the file.");
});
