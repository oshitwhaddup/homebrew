// Adapted from 5etools `clean-jsons.js`
// ===
"use strict";

const fs = require("fs");

function isDirectory (path) {
	return fs.lstatSync(path).isDirectory();
}

function readJSON (path) {
	try {
		return JSON.parse(fs.readFileSync(path, "utf8"));
	} catch (e) {
		e.message += ` (Path: ${path})`;
		throw e;
	}
}

function listFiles (dir) {
	const dirContent = fs.readdirSync(dir, "utf8")
		.map(file => `${dir}/${file}`);
	return dirContent.reduce((acc, file) => {
		if (isDirectory(file)) {
			acc.push(...listFiles(file));
		} else {
			acc.push(file);
		}
		return acc;
	}, [])
}

const replacements = {
	"—": "\\u2014",
	"–": "\\u2013",
	"−": "\\u2212",
	"’": "'",
	"“": '\\"',
	"”": '\\"',
	"…": "..."
};

const replacementRegex = new RegExp(Object.keys(replacements).join("|"), 'g');

function cleanFolder (folder) {
	const files = listFiles(folder);
	files
		.map(file => ({
			name: file,
			contents: readJSON(file)
		}))
		.map(file => {
			file.contents = JSON.stringify(file.contents, null, "\t") + "\n";
			return file;
		})
		.map(file => {
			file.contents = file.contents.replace(replacementRegex, (match) => {
				return replacements[match];
			});
			return file;
		})
		.forEach(file => {
			fs.writeFileSync(file.name, file.contents);
		});
}

fs.readdirSync(".", "utf8")
	.filter(dir => isDirectory(dir) && !dir.startsWith(".") && !dir.startsWith("_") && dir !== "node_modules")
	.forEach(it => {
		console.log(`Cleaning dir "${it}"...`);
		cleanFolder(it);
	});
console.log("Cleaning complete.");
