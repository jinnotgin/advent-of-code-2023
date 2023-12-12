import fs from "fs";
import readline from "readline";

const filePath = "./input.txt";
const fileStream = fs.createReadStream(filePath);

const rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity,
});

let time = [];
let distance = [];

rl.on("line", (line) => {
	console.log(`Line from file: ${line}`);

	if (line.includes("Time:")) {
		time = [...line.match(/\d+/g).map((item) => parseInt(item))];
		return;
	}

	if (line.includes("Distance:")) {
		distance = [...line.match(/\d+/g).map((item) => parseInt(item))];
		return;
	}
});

let allRacesData = [];
rl.on("close", () => {
	console.log("Finished reading the file.");
	for (let i = 0; i < time.length; i++) {
		allRacesData.push({ raceTime: time[i], raceDistance: distance[i] });
	}
	console.log({ allRacesData });

	let multipliedNo = 1;
	for (let { raceTime, raceDistance } of allRacesData) {
		let waysToWin = 0;
		for (let holdTime = 0; holdTime <= raceTime; holdTime++) {
			const distance = getDistanceTravelled(raceTime, holdTime);

			if (distance > raceDistance) {
				waysToWin++;
			}
		}
		console.log({ raceTime, raceDistance, waysToWin });
		if (waysToWin > 0) multipliedNo = multipliedNo * waysToWin;
	}
	console.log({ multipliedNo });
});

function getDistanceTravelled(raceTime, holdTime) {
	const STARTING_SPEED = 0;
	const SPEED_INCREASE_PER_TIME_UNIT = 1;

	const newSpeed = holdTime * SPEED_INCREASE_PER_TIME_UNIT;

	const travelTime = raceTime - holdTime;
	const displacement = travelTime * newSpeed;

	return displacement;
}

// multipliedNo: 1155175
