function fix2(recordStr, damageRecord, prevDamageCount = 0, restored = "") {
	if (recordStr.length === 0) return restored;

	const output = [];
	if (recordStr[0] === ".") {
		if (prevDamageCount > 0) prevDamageCount = 0;

		restored += recordStr[0];
		recordStr = recordStr.slice(1, recordStr.length);

		output.push([recordStr, damageRecord, prevDamageCount, restored]);
	} else if (recordStr[0] === "#") {
		const damageStr =
			recordStr.length === 1 ? "#" : recordStr.match(/#+(?=.)/)[0];

		const newDamageCount = prevDamageCount + damageStr.length;
		const damageMaxCount = damageRecord[0];

		const CAN_ADD_DAMAGE = newDamageCount <= damageMaxCount;
		if (CAN_ADD_DAMAGE) {
			if (newDamageCount === damageMaxCount) {
				damageRecord.shift();
				prevDamageCount = 0;
			}

			restored += damageStr;
			recordStr = recordStr.replace(damageStr, "");

			output.push([recordStr, damageRecord, newDamageCount, restored]);
		}
	} else if (recordStr[0] === "?") {
		console.log({ recordStr, damageRecord, prevDamageCount, restored });
		recordStr = recordStr.slice(1, recordStr.length);

		output.push([recordStr, damageRecord, prevDamageCount, `${restored}.`]);

		const CAN_ADD_DAMAGE =
			(damageRecord.length > 0 && prevDamageCount < damageRecord[0]) ||
			restored[restored.length - 1] === ".";
		if (CAN_ADD_DAMAGE) {
			const ADD_DAMAGE_WILL_RESET = prevDamageCount + 1 === damageRecord[0];
			const NEXT_LETTER_IS_QUESTION =
				recordStr.length > 1 && recordStr[0] === "?";

			console.log({
				recordStr,
				damageRecord: damageRecord[0],
				prevDamageCount,
				ADD_DAMAGE_WILL_RESET,
				NEXT_LETTER_IS_QUESTION,
			});

			output.push([
				ADD_DAMAGE_WILL_RESET && NEXT_LETTER_IS_QUESTION
					? recordStr.slice(1, recordStr.length)
					: recordStr,
				ADD_DAMAGE_WILL_RESET ? damageRecord.toSpliced(0, 1) : damageRecord,
				ADD_DAMAGE_WILL_RESET ? 0 : prevDamageCount + 1,
				ADD_DAMAGE_WILL_RESET && NEXT_LETTER_IS_QUESTION
					? `${restored}#.`
					: `${restored}#`,
			]);
		}
	}

	return output;
}

function getValidStates(states, originalDamageRecord) {
	return states.filter(
		([recordStr, damageRecord, prevDamageCount, restored]) => {
			if (recordStr === "") {
				const NO_MORE_DAMAGE = damageRecord.length === 0;
				return NO_MORE_DAMAGE;

				// ADD CHECKING to make sure output is valid
			} else {
				const damageRecordLength = damageRecord.length;
				const minValidRecordStrLength =
					damageRecord.reduce((acc, x) => acc + x, 0) + damageRecordLength - 1;
				return recordStr.length >= minValidRecordStrLength;
			}
		}
	);
}

const shift = (strOrArray) => strOrArray.slice(1, strOrArray.length);

function fix(springs, damages, damageCount = 0, fixed = "") {
	if (springs === "") return [[springs, damages, damageCount, fixed]];

	const output = [];

	const item = springs[0];
	const remaining = shift(springs);

	switch (item) {
		case ".":
			output.push([remaining, damages, 0, `${fixed}${item}`]);
			break;
		case "#": {
			const CAN_ADD_DAMAGE = damages.length > 0 && damageCount < damages[0];
			if (CAN_ADD_DAMAGE) {
				const damagePortion = springs.match(/#+/)[0];

				let newDamageCount = damageCount + damagePortion.length;
				let newDamages = damages;
				let newRemaining = springs.replace(damagePortion, "");
				let newFixed = `${fixed}${damagePortion}`;

				const HIT_MAX_DAMAGE_COUNT = newDamageCount === damages[0];
				if (HIT_MAX_DAMAGE_COUNT) {
					newDamageCount = 0;
					newDamages = shift(damages);
				}

				console.log({
					springs,
					fixed,
					damagePortion,
					damageCount,
					newDamageCount,
				});

				output.push([newRemaining, newDamages, newDamageCount, newFixed]);
			}
			break;
		}
		case "?": {
			// fix using "."
			output.push([remaining, damages, 0, `${fixed}.`]);

			// fix using "#"
			const CAN_BEGIN_ADD_DAMAGE =
				damageCount === 0 && fixed[fixed.length - 1] !== "#";
			const CAN_CONTNUE_ADD_DAMAGE =
				damages.length > 0 && damageCount < damages[0];

			if (CAN_BEGIN_ADD_DAMAGE || CAN_CONTNUE_ADD_DAMAGE) {
				let newDamageCount = damageCount + 1;
				let newDamages = damages;
				let newFixed = `${fixed}#`;
				let newRemaining = remaining;

				const HIT_MAX_DAMAGE_COUNT = newDamageCount === damages[0];
				if (HIT_MAX_DAMAGE_COUNT) {
					newDamageCount = 0;
					newDamages = shift(damages);
					if (springs.length > 0) {
						newFixed = `${fixed}#.`;
						newRemaining = shift(remaining);
					}
				}

				output.push([newRemaining, newDamages, newDamageCount, newFixed]);
				break;
			}
		}
		default:
			break;
	}
	return output;
}

function filterValid(states, allSprings, knownDamages) {
	return states.filter((state) => {
		const [springs, damages, damageCount, fixed] = state;

		console.log(fixed.length);
		console.log(allSprings.length);
		if (fixed.length === allSprings.length) {
			const damagePattern = new RegExp(
				knownDamages.map((x) => `#{${x}}`).join("\\.+")
			);
			const FIX_MATCHES_DAMAGE_PATTERN = fixed.match(damagePattern) !== null;
			console.log({ fixed, damagePattern, FIX_MATCHES_DAMAGE_PATTERN });
			if (!FIX_MATCHES_DAMAGE_PATTERN) return false;
		} else {
			const minValidSpringsLength =
				damages.slice(1, damages.length).reduce((acc, x) => acc + x, 0) +
				damages.length -
				1;

			const SPRINGS_HAS_MINIMUM_VALID_LENGTH =
				springs.length >= minValidSpringsLength;
			// e.g if remaining damage is (1,3), then remaining springs should be at least length of 4
			if (!SPRINGS_HAS_MINIMUM_VALID_LENGTH) return false;
		}

		// matches overall pattern
		const pattern = new RegExp(
			`${allSprings
				.slice(0, fixed.length)
				.replace(/\?/, ".")
				.replace(/\./, "\\.")}`
		);
		const FIX_LOOKS_CORRECT = fixed.match(pattern) !== null;
		return FIX_LOOKS_CORRECT;
	});
}

function fixRow(row) {
	const [allSprings, knownDamagesStr] = row.split(" ");
	const knownDamages = knownDamagesStr.split(",").map((x) => parseInt(x));

	let IN_PROGRESS = true;
	let states = [[String(allSprings), [...knownDamages]]]; // make a working copy
	while (IN_PROGRESS) {
		const result = states.map((state) => fix(...state)).flat();
		states = filterValid(result, allSprings, knownDamages);

		IN_PROGRESS = !states.every(([springs]) => springs === "");
		console.log({
			result: result.map(([a, b, c, d]) => [a, b.join(","), c, d]),
			states: states.map(([a, b, c, d]) => [a, b.join(","), c, d]),
			IN_PROGRESS,
		});
	}
	console.log("ended");
	console.log(states.length);
}

fixRow("?#?#?#?#?#?#?#? 1,3,1,6");
