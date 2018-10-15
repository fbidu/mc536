const _ = require('lodash'),
	fs = require('fs'),
	j5 = require('json5');

const defnnn = ['CSTUMSIZ', 'EOD10_SZ'];
const defz = ['INSREC_PUB'];

const dataFile = process.argv[2],
	formatFile = process.argv[3],
	outputFile = process.argv[4],
	uniqKey = process.argv[5];

const lines = _.dropRight(fs.readFileSync(`../data/${dataFile}`).toString().split('\n'), 1);
const format = j5.parse(fs.readFileSync(`../data/${formatFile}.json`).toString());
const fields = Object.keys(format);


let CSV = Object.keys(format).join(',') + '\n';
let uniqSet = new Set();

for (const line of lines) {
	let entry = [];
	let fullEntry = true;

	for (let [key, value] of Object.entries(format)) {
		let v = line.substring(value[0] - 1, value[0] + value[1] - 1).trim();

		if (v === '') {
			value[2] = (value[2] || 0) + 1;

			if (defnnn.includes(key)) {
				v = '999';
			} else if (defz.includes(key)) {
				v = '0';
			} else {
				fullEntry = false;
				break;
			}
		}

		if (key == uniqKey) {
			if (uniqSet.has(v)) {
				fullEntry = false;
				value[3] = (value[3] || 0) + 1;
				break;
			}

			uniqSet.add(v);
		}

		entry.push(v);
	}

	if (!fullEntry) {
		continue;
	}

	CSV += entry.join(',') + '\n';
}

fs.writeFileSync(`../data/${outputFile}.csv`, CSV);

console.log(_.mapValues(format, v => [v[2] || 0, v[3] || 0]));
