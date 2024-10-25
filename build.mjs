import fs from 'fs';
import path from 'path';
import { minify } from 'terser';
import crypto from 'crypto';
import archiver from 'archiver';

const cacheDir = 'cache';
const buildDir = 'build\\raw';
const distDir = 'build\\dist';
const finalDistDir = 'build\\change';
const hashFileName = 'hash4build.json';

function minifyJsonFile(srcPath, destPath) {
	const dir = path.dirname(destPath);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
	const data = fs.readFileSync(srcPath, 'utf8');
	const minifiedData = JSON.stringify(JSON.parse(data));
	fs.writeFileSync(destPath, minifiedData, 'utf8');
}

async function minifyHandle(dirPath) {
	const files = fs.readdirSync(dirPath);
	for (const file of files) {
		const filePath = path.join(dirPath, file);
		const stats = fs.statSync(filePath);

		if (stats.isDirectory()) {
			const distDirPath = filePath.replace(buildDir, distDir);

			if (!fs.existsSync(distDirPath)) {
				fs.mkdirSync(distDirPath, { recursive: true });
			}
			await minifyHandle(filePath);
		} else if (filePath.endsWith('.js')) {
			const distFilePath = filePath.replace(buildDir, distDir);
			const fileContent = fs.readFileSync(filePath, 'utf8');
			if (fileContent.length === 0) {
				fs.copyFileSync(filePath, distFilePath);
			} else {
				//minify
				const minifiedCode = await minify(fileContent, {});
				fs.writeFileSync(distFilePath, minifiedCode.code);
			}
		} else {
			const distFilePath = filePath.replace(buildDir, distDir);
			if (!fs.existsSync(path.dirname(distFilePath))) {
				fs.mkdirSync(path.dirname(distFilePath), { recursive: true });
			}
			fs.copyFileSync(filePath, distFilePath);
		}
	}
}

function hashHandle(dirPath) {
	const result = {};
	const files = fs.readdirSync(dirPath);

	for (const file of files) {
		const filePath = path.join(dirPath, file);
		const stats = fs.statSync(filePath);

		if (stats.isDirectory()) {
			Object.assign(result, hashHandle(filePath));
		} else {
			const relativePath = path.relative(distDir, filePath);

			const fileContent = fs.readFileSync(filePath);
			const hash = crypto
				.createHash('sha256')
				.update(fileContent)
				.digest('hex');

			result[relativePath] = hash;
		}
	}

	return result;
}

function compareHashes(newHashes, oldHashes) {
	return Object.keys(newHashes).reduce((changedFiles, file) => {
		if (oldHashes[file] !== newHashes[file]) {
			changedFiles[file] = newHashes[file];
		}
		return changedFiles;
	}, {});
}

function copyChangedFiles(changedFiles, srcDir, destDir) {
	Object.keys(changedFiles).forEach((file) => {
		const srcFilePath = path.join(srcDir, file);
		const destFilePath = path.join(destDir, file);
		const destDirPath = path.dirname(destFilePath);

		if (!fs.existsSync(destDirPath)) {
			fs.mkdirSync(destDirPath, { recursive: true });
		}

		if (fs.existsSync(srcFilePath)) {
			fs.copyFileSync(srcFilePath, destFilePath);
		} else {
			/* eslint-disable-next-line no-undef */
			console.error(`File not found: ${srcFilePath}`);
		}
	});
}

async function createHashFile() {
	const newHashes = hashHandle(distDir);

	const previousHashes = fs.existsSync(path.join(cacheDir, hashFileName))
		? JSON.parse(fs.readFileSync(path.join(cacheDir, hashFileName), 'utf8'))
		: {};

	const changedFiles = compareHashes(newHashes, previousHashes);
	if (!fs.existsSync(finalDistDir)) {
		fs.mkdirSync(finalDistDir, { recursive: true });
	}
	copyChangedFiles(changedFiles, distDir, finalDistDir);

	if (!fs.existsSync(cacheDir)) {
		fs.mkdirSync(cacheDir, { recursive: true });
	}
	fs.writeFileSync(
		path.join(cacheDir, hashFileName),
		JSON.stringify(newHashes, null, 2),
		'utf8'
	);
}

function zipFolder(sourceDir, outputFile) {
	return new Promise((resolve, reject) => {
		const output = fs.createWriteStream(outputFile);
		const archive = archiver('zip', {
			zlib: { level: 9 }
		});

		output.on('close', () => {
			resolve(`File ZIP đã được tạo: ${outputFile}`);
		});

		archive.on('error', (err) => {
			reject(err);
		});

		archive.pipe(output);

		archive.directory(sourceDir, false);

		archive.finalize();
	});
}

//================start===============

minifyJsonFile('./package.json', path.join(distDir, 'package.json'));
minifyJsonFile('./package-lock.json', path.join(distDir, 'package-lock.json'));

fs.copyFileSync('./.env', path.join(distDir, '.env'));
fs.copyFileSync('./model.nlp', path.join(distDir, 'model.nlp'));

await minifyHandle(buildDir);

await createHashFile();

minifyJsonFile(
	path.join(cacheDir, hashFileName),
	path.join(distDir, hashFileName)
);
minifyJsonFile(
	path.join(cacheDir, hashFileName),
	path.join(finalDistDir, hashFileName)
);

zipFolder(distDir, path.join('build', 'dist.zip'));
zipFolder(finalDistDir, path.join('build', 'change.zip'));
