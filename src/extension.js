/*
Insert Molang File [Minecraft Bedrock] -  VSCode Extension - 
Brings options to easily insert contents of a `.molang` file into a 
`.json` file for Minecraft Bedrock add-ons.
Copyright (C) 2024 PavelDobCZ23

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

//# Activation of the extension:
function activate(context) {
	//## Command and Context Menu Insert:
	context.subscriptions.push(
		vscode.commands.registerCommand('molang-insert.openUi', molangInsertUi)
	);

	//## Typing Insert:
	const typingEnabled = vscode.workspace.getConfiguration('molang-insert.typing').get('enabled');
	if (typingEnabled) {
		context.subscriptions.push(
			vscode.workspace.onDidChangeTextDocument(textDocumentChange)
		);
	}
}

//# UI for molang insert
function molangInsertUi() {
	const textEditor = vscode.window.activeTextEditor;
	const document = textEditor?.document;
	const selection = textEditor?.selection;
	if (document == null || selection == null) {
		vscode.window.showInformationMessage(`Text editor isn't open!`);
		return;
	}

	const addonPath = getAddonRootPath(document.fileName);
	if (addonPath == null) {
		vscode.window.showInformationMessage(`Can't identify this as behavior/resource pack file!`);
		return;
	}
	const molangPath = getMolangPath(addonPath);
	if (molangPath == null) return;

	const selectedString = findString(document, selection);
	if (selectedString == null) {
		vscode.window.showInformationMessage(`Your cursor isn't inside a string!`);
		return;
	}

	const insertIntoString = `${document.fileName} @ Line ${selection.start.line + 1}`;
	const uiHtml = generateUiContent(molangPath, insertIntoString);
	if (uiHtml == null) return;

	const panel = vscode.window.createWebviewPanel(
		'molang-insert',
		'Insert Molang File',
		textEditor.viewColumn,
		{enableScripts: true}
	);
	panel.webview.html = uiHtml;

	panel.onDidChangeViewState(event => {
		if (!event.webviewPanel.visible) panel.dispose();
	});
	panel.onDidDispose(
		() => panel = undefined
	);
	panel.webview.onDidReceiveMessage(
		(event) => {
			if (event.command === "close") panel.dispose();
			if (event.command === "file") {
				panel.dispose();
				vscode.window.showTextDocument(document, textEditor.viewColumn);
				const molangFile = path.join(molangPath,event.text);
				insertMolangFile(molangFile, selectedString.range);
			}
		}
	);
}


//# Molang insert UI generator:
function generateUiContent(molangPath, insertIntoString) {
	let files = {};
	let filesHtml = '';
	//## Read the files:
	readDirFilesRecursiveSync(molangPath, (file,dir) => {
		if (!file.name.endsWith('.molang')) return;
		const filePath = path.join(dir,file.name);
		const fileName = path.relative(molangPath,filePath);
		files[fileName] = {};
		files[fileName].date = fs.statSync(filePath).mtime;
		files[fileName].preview = trimMolang(fs.readFileSync(filePath, 'utf8'));
	});
	//## Check if empty:
	if (isObjectEmpty(files)) {
		vscode.window.showInformationMessage(`Molang folder doesn't have any .molang files inside!`);
		return null;
	}
	//## Sort the files:
	const fileSorting = vscode.workspace.getConfiguration('molang-insert').get('fileSorting');
	if (fileSorting === 'dateModified') {
		files = Object.fromEntries(
			Object.entries(files).sort(([, a], [, b]) => b.date - a.date)
		);
	}
	if (fileSorting === 'alphabetical') {
		files = Object.fromEntries(
			Object.entries(files).sort()
		);
	}
	//## Generate file list:
	for (const fileName in files) {
		const preview = files[fileName].preview;
		const dateModified = files[fileName].date.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', hour12: false, minute: '2-digit' });
		filesHtml += `<button class="file-item" onclick="sendMessage('file','${fileName.replace('\\','\\\\')}');"> <span class="name">${fileName}</span> <div class="preview">${preview}</div> <span class="date-modified"><i>Date modified: ${dateModified}</i></span> </button>`;
	}
	return `<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>Insert Molang File</title> </head> <style> * { color: var(--vscode-foreground); } .bold { font-weight: bold; } .file-item { width: 40rem; max-width: 100%; background-color: var(--vscode-sideBar-background); padding: 10px; border-width: 0 0 1px 0; border-style: solid; border-color: var(--vscode-foreground); margin-bottom: 0px; box-sizing: border-box; display: block; text-align: left; } .file-item:focus-within { outline: 2px solid var(--vscode-foreground); outline-offset: -1px; } .file-item:hover, .file-item:focus { background-color: var(--vscode-list-hoverBackground); user-select: none; cursor: pointer; } .file-item .preview { font-family: var(--vscode-font-family); font-size: 110%; padding-right: 11px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; } .file-item .name { font-family: var(--vscode-font-family); font-size: 110%; padding-right: 11px; font-weight: 700; } .file-item .date-modified { font-size: 90%; font-weight: 600; padding-right: 11px; font-family: var(--vscode-font-family); } .file-item .no-file { font-family: var(--vscode-font-family); font-size: 150%; font-weight: 700; } </style> <script> const vscode = acquireVsCodeApi(); function sendMessage(command, text) { vscode.postMessage({ command: command, text: text }); } </script> <body> <h1>Insert Molang File</h1> <p><span class="bold">Inserting into file:</span> <code>${insertIntoString}</code></p> <p><span class="bold">Molang directory:</span> <code>${molangPath}</code></p> <p>Pick a file from the list of molang files found here:</p> <div> ${filesHtml} </div> </body> </html>`;
}

//# Typing insert trigger:
/**
 * 
 * @param {import('vscode').ChangeTe} event 
 * @returns 
 */
function textDocumentChange(event) {
	//~ Prevents breaking the ability to undo insertion.
	if (
		event.reason === vscode.TextDocumentChangeReason.Undo || event.reason === vscode.TextDocumentChangeReason.Redo
	) return;
	
	const document = event.document;
	const textEditor = vscode.window.activeTextEditor;
	const selection = textEditor?.selection;
	//## Process the paths
	if (!document.fileName.endsWith('.json') || !selection?.isSingleLine) return;
	const addonPath = getAddonRootPath(document.fileName);
	if (addonPath == null) return;
	const molangPath = getMolangPath(addonPath);
	if (molangPath == null) return;
	//## Process the string
	const prefix = vscode.workspace.getConfiguration('molang-insert.typing').get('prefix');
	const selectedString = findString(document, selection);
	if (!(selectedString && selectedString.text.startsWith(prefix))) return;
	//## Try to insert
	const molangFile = path.join(molangPath,selectedString.text.substring(prefix.length));
	insertMolangFile(molangFile,selectedString.range);
}

//# Inserting molang File
/**
 * Function that handles the inserting trimmed Molang file code into the string selection.
 * @param {string} addonPath Path to the root of the pack, where the `molang` folder would be located.
 * @param {string} filePath Path to the molang File.
 * @param {import('vscode').SelectionRange} insertRange Range inside the editor which gets replaced.
 */
function insertMolangFile(filePath, insertRange) {
	//## Basic checks
	if (!filePath.endsWith('.molang')) return;
	if (!fs.existsSync(filePath)) {
		vscode.window.showInformationMessage(`"${path.basename(filePath)}" doesn't exist!`);
		return;
	}
	//## Read, trim and replace (magic with promises)
	try {
		const molangText = trimMolang(
			fs.readFileSync(filePath, 'utf8')
		);
		function editText() {
			function waitForEditor(resolve, reject) {
				if (vscode.window.activeTextEditor != null) {
					resolve(vscode.window.activeTextEditor);
				} else {
					setTimeout(waitForEditor.bind(this, resolve, reject), 100);
				}
			}
			return new Promise(waitForEditor);
		}
		editText().then(function () {
			vscode.window.activeTextEditor.edit(editBuilder => {
				editBuilder.replace(insertRange, molangText);
				vscode.window.showInformationMessage(
					`"${path.basename(filePath)}" successfully inserted!`
				);
			})
		});
	} catch (error) {
		vscode.window.showInformationMessage(`${error}`);
		vscode.window.showInformationMessage(
			`Fatal error has ocuured when inserting "${path.basename(filePath)}"!`
		);
	}
}

//# Helper functions
/**
 * Makes the first character of string lower case.
 * @param {string} inputString The input string.
 * @returns {string} String with 1st letter lowercase.
 */
function firstLetterLower(inputString) {
	if (inputString.length === 0) return inputString;
	return inputString[0].toLowerCase() + inputString.slice(1);
}
/**
 * Returns boolean indicating if given object contains no keys (is empty).
 * @param {object} object The input object.
 * @returns {boolean} Whether or not object is empty.
 */
function isObjectEmpty(object) {
	for (_ in object) return false;
	return true;
}
/**
 * Calls `callback()` for all files of a directory and recursively calls itself to all subdirectories.
 * @param {string} dir Directory to recursively read files from.
 * @param {Function} callback Takes `file{fs.Dirent}` from `fs.readdirSync(dir, { withFileTypes: true })).forEach(file => ...` and `dir{string}` which is the directory the file is from.
 */
function readDirFilesRecursiveSync(dir, callback) {
	fs.readdirSync(dir, { withFileTypes: true }).forEach(file => {
		if (file.isFile()) callback(file,dir);
		if (file.isDirectory() || file.isSymbolicLink()) {
			readDirFilesRecursiveSync(path.join(dir,file.name),callback);
		}
	});
}
/**
 * Gets the root path of the addon, it first checks for overrides and if overrides don't match, 
 * then it uses regex to automatically search for the root path.
 * @param {string} filePathInput 
 * @returns {string}
 */
function getAddonRootPath(filePathInput) {
	//## Get file paths.
	//~ Have to make 1st letter lowercase to normalize drive letters on WinNT. Won't affect UNIX - first character isn't a letter.
	const filePath = firstLetterLower(filePathInput);
	const overrideBeh = firstLetterLower(
		vscode.workspace.getConfiguration('molang-insert').get('behaviorPackPath')
	);
	const overrideRes = firstLetterLower(
		vscode.workspace.getConfiguration('molang-insert').get('resourcePackPath')
	);
	//## Check overrides
	if (overrideBeh != '' && filePath.startsWith(overrideBeh)) return overrideBeh;
	if (overrideRes != '' && filePath.startsWith(overrideRes)) return overrideRes;
	if (overrideBeh != '' && overrideRes != '') {
		vscode.window.showInformationMessage(
			'This file isn\'t within any override path, fallback to auto detection!'
		);
	}
	//## Automatic detection
	const fileRegex = /(?:\/|\\)((?:subpacks|features|biomes|feature_rules|entities|entity|blocks|items|animations|animation_controllers|attachables|particles|render_controllers)(?:\/|\\).*?[^\/\\]*\.json)/gmi;
	const fileMatch = fileRegex.exec(filePath);
	if (fileMatch == null) return null;
	return filePath.slice(0,filePath.length - fileMatch[1].length);
}
/**
 * Joins the addon root path with `molang` and checks if the exists, in such case sending a warning to the user.
 * @param {string} addonPath Addon root path.
 * @returns {string | null} Molang folder or `null` when non-existant.
 */
function getMolangPath(addonPath) {
	const molangPath = path.join(addonPath,'molang');
	if (!fs.existsSync(molangPath)) {
		vscode.window.showInformationMessage(`Pack's path: ${addonPath}`);
		vscode.window.showInformationMessage(`Molang folder can\'t be found in the pack! Read extension page for help!`);
		return null;
	}
	return molangPath;
}

//# Trimming molang code
const CommentTypes = {
	'none': -1,
	'inline': 0,
	'block': 1
};

/**
 * Algorithm to trim molang source code text of comments, new lines and repeating spaces.
 * @param {string} molangText 
 * @returns 
 */
function trimMolang(molangText) {
	let trimmedMolangString = '';

	const quoteChar = '\'';
	const inlineCommentChars = '//';
	const inlineCommentSingleChar = '#';
	const blockCommentChars = ['/*','*/'];

	let inString = false;
	let inComment = CommentTypes.none;
	let holdChars = '';

	for (let index = 0;index < molangText.length;index++) {
		const char = molangText[index];

		//## Molang string handling, comments don't work inside.
		if (char === quoteChar && inComment === CommentTypes.none) inString = !inString;
		if (inString) {
			if (char !== '\n' && char !== '\r') trimmedMolangString += char;
			continue;
		}

		let sliceToCompare;
		switch (inComment) {
			case CommentTypes.none:
				//## Inline Comments
				sliceToCompare = molangText.slice((index-inlineCommentChars.length)+1,index+1);
				if (sliceToCompare === inlineCommentChars) inComment = CommentTypes.inline;
				//## Single Character Inline Comments
				if (char === inlineCommentSingleChar) inComment = CommentTypes.inline;
				//## Block Comments
				sliceToCompare = molangText.slice((index-blockCommentChars[0].length)+1,index+1);
				if (sliceToCompare === blockCommentChars[0]) inComment = CommentTypes.block;
				//## String still isn't start of a comment.
				if (inComment === CommentTypes.none) {
					//## First "on hold" character isn't start of a comment, so it gets put "out of hold"
					if (holdChars.length === 1) {
						trimmedMolangString += holdChars[0];
						holdChars = holdChars.slice(1);
					}
					//## Character might be start of a comment, so it gets put "on hold".
					if (char === blockCommentChars[0][0] || char === inlineCommentChars[0]) {
						holdChars += char;
					}
					//## Nothing is "on hold", character can be safely returned.
					if (
						holdChars.length === 0 && char !== '\n' && char !== '\r' &&
						!(char === ' ' && trimmedMolangString.at(-1) === ' ')
					) {
						trimmedMolangString += char;
					}
				} else {
					//## Reset characters "on hold", because the characters were start of a comment.
					holdChars = '';
				}
			break;
			case CommentTypes.inline:
				//## Inline comments break on a newline.
				if (char === '\n') {
					inComment = CommentTypes.none;
				}
			break;
			case CommentTypes.block:
				//## Block comments break on breaking characters.
				sliceToCompare = molangText.slice((index-blockCommentChars[1].length)+1,index+1);
				if (sliceToCompare === blockCommentChars[1]) {
					inComment = CommentTypes.none;
				}
			break;
		}
	}
	return trimmedMolangString;
}

//# Finding string in editor
/**
 * Gets and parses quoted string inside which the cursor is located.
 * @param {import('vscode').TextDocument} document 
 * @param {import('vscode').Selection} selection 
 * @returns 
 */
function findString(document, selection) {
	const line = document.lineAt(selection.end.line);
	const stringRegex = /"(.*?)(?<!\\)"/g;

	while (regexArray = stringRegex.exec(line.text)) {
		let start = regexArray.index + 1;
		let end = start + regexArray[1].length;

		if (start - 1 < selection.end.character && selection.end.character < end + 1) {
			const text = line.text.substring(start, end);
			const range = new vscode.Range(
				new vscode.Position(selection.end.line, start),
				new vscode.Position(selection.end.line, end)
			);
			return {
				text,
				range
			}
		}
	}
	return null;
}

//# Boilerplate
function deactivate() { }

module.exports = {
	activate,
	deactivate
}