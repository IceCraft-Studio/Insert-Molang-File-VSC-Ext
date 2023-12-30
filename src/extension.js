/*
Insert Molang File [VSCode Extension] - Brings options to easily insert
contents of a `.molang` file into a `.json` file for MC Bedrock add-ons.
Copyright (C) 2023  PavelDobCZ23

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

//# Activation of the Extension:
function activate(context) {
	console.log('Insert MoLang File [Minecraft Bedrock] - Loaded');

	//### Command and Context Menu Insert:
	context.subscriptions.push(
		vscode.commands.registerCommand('molang-insert.openUi', () => molangInsertUi())
	);

	//### Typing Insert:
	const typingEnabled = vscode.workspace.getConfiguration('molang-insert.typing').get('enabled');
	if (typingEnabled) {
		context.subscriptions.push(
			vscode.workspace.onDidChangeTextDocument(event => textDocumentChange(event))
		);
	}
}

//# UI for Molang Insert
function molangInsertUi() {
	const textEditor = vscode.window.activeTextEditor;
	const document = textEditor?.document;
	const selection = textEditor?.selection;
	if (document == null || selection == null) {
		vscode.window.showInformationMessage(`Text editor isn't open!`);
		return;
	}

	let panel = vscode.window.createWebviewPanel(
		'molang-insert',
		'Insert Molang File',
		textEditor.viewColumn,
		{enableScripts: true}
	);

	const fileRegex = /(?:\/|\\)((?:subpacks|features|biomes|feature_rules|entities|entity|blocks|items|animations|animation_controllers|attachables|particles|render_controllers)(?:\/|\\).*?[^\/\\]*\.json)/gmi;
	const fileMatch = fileRegex.exec(document.fileName);
	if (fileMatch == null) {
		panel.dispose();
		vscode.window.showInformationMessage(`Can't identify this as behavior/resource pack file!`);
		return;
	}

	const string = findString(document, selection);
	if (string == null) {
		panel.dispose();
		vscode.window.showInformationMessage(`Your cursor isn't targeting a string!`);
		return;
	}

	const addonPath = document.fileName.slice(0,document.fileName.length - fileMatch[1].length);
	const insertIntoString = `${document.fileName} @ Line ${selection.start.line + 1}`;
	panel.webview.html = generateUiContent(addonPath, panel, insertIntoString);

	panel.onDidChangeViewState(event => {
		if (!event.webviewPanel.visible) panel.dispose();
	});

	panel.onDidDispose(
		() => panel = undefined
	);

	panel.webview.onDidReceiveMessage(
		event => {
			if (event.command === "close") {
				panel.dispose();
			} else if (event.command === "file") {
				panel.dispose();
				vscode.window.showTextDocument(document, textEditor.viewColumn);
				string.text = event.text;
				insertMolangFile(addonPath, string, '');
			}
		}
	);
}

function getAddonRootPath() {
	
}

//# MoLang Insert UI Generator:
function generateUiContent(addonPath, panel, insertIntoString) {
	const molangFolder = path.join(addonPath, 'molang');
	let files = {};
	let fileItems = '';

	//## File Info:
	if (!fs.existsSync(molangFolder)) {
		panel.dispose();
		vscode.window.showInformationMessage(`Path: ${molangFolder}`);
		vscode.window.showInformationMessage(`Molang folder can't be found in the addon! Read extension page for help!`);
		return;
	}
	try {
		fs.readdirSync(molangFolder).forEach(file => {
			if (file.endsWith('.molang')) {
				const filePath = path.join(molangFolder, file);
				files[file] = {};
				files[file].date = fs.statSync(filePath).mtime;
				files[file].preview = trimMolang(fs.readFileSync(filePath, 'utf8'));
			}
		});
	} catch (error) {
		panel.dispose();
		vscode.window.showInformationMessage(`${error}`);
		vscode.window.showInformationMessage(`Path: ${molangFolder}`);
		vscode.window.showInformationMessage(`Molang folder can't be found in the addon! Read extension page for help!`);
		return;
	}

	//File List:
	if (Object.keys(files).length) {
		const fileSorting = vscode.workspace.getConfiguration('molang-insert').get('fileSorting');
		if (fileSorting === "dateModified") {
			files = Object.fromEntries(
				Object.entries(files).sort(([, a], [, b]) => b.date - a.date)
			);
		} else if (fileSorting === "alphabetical") {
			files = Object.fromEntries(
				Object.entries(files).sort()
			);
		}
		for (const file in files) {
			const preview = files[file].preview;
			const dateModified = files[file].date.toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", hour12: false, minute: "2-digit" });
			const fileName = file;
			fileItems += `<div class="file-item" onclick="sendMessage('file','${fileName}');"> <span class="name">${fileName}</span> <div class="preview">${preview}</div> <span class="date-modified"><i>Date modified: ${dateModified}</i></span> </div>`;
		}
	} else {
		panel.dispose();
		vscode.window.showInformationMessage(`Molang folder doesn't have any MoLang files inside!`);
		return;
	}
	const htmlCode = `<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>Insert Molang File</title> </head> <style> * { color: var(--vscode-foreground); } .bold { font-weight: bold; } .file-item { width: 25rem; background-color: var(--vscode-sideBar-background); padding: 7px; margin-bottom: 0px; box-sizing: border-box; } .file-item:hover { background-color: var(--vscode-list-hoverBackground); outline: 1px dashed var(--vscode-toolbar-hoverOutline); outline-offset: -1px; user-select: none; cursor: pointer; } .file-item .preview { font-family: var(--vscode-font-family); font-size: 110%; padding-right: 11px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; } .file-item .name { font-family: var(--vscode-font-family); font-size: 110%; padding-right: 11px; font-weight: 700; } .file-item .date-modified { font-size: 90%; font-weight: 600; padding-right: 11px; font-family: var(--vscode-font-family); } .file-item .no-file { font-family: var(--vscode-font-family); font-size: 150%; font-weight: 700; } </style> <script> const vscode = acquireVsCodeApi(); function sendMessage(command, text) { vscode.postMessage({ command: command, text: text }); } </script> <body> <h1>Insert Molang File</h1> <p><span class="bold">Inserting into file:</span> <code>${insertIntoString}</code></p> <p><span class="bold">Molang directory:</span> <code>${molangFolder}</code></p> <p>Pick a file from the list of files found here:</p> <div> ${fileItems} </div> </body> </html>`;
	return htmlCode;
}

//# Typing Insert Trigger:
/**
 * 
 * @param {import('vscode').TextDocumentChangeEvent} event 
 * @returns 
 */
function textDocumentChange(event) {
	const document = event.document;
	const textEditor = vscode.window.activeTextEditor;
	const selection = textEditor?.selection;
	if (selection == null) return;

	if (document.fileName.endsWith('.json') && selection.isSingleLine) {
		const fileRegex = /(?:\/|\\)((?:subpacks|features|biomes|feature_rules|entities|entity|blocks|items|animations|animation_controllers|attachables|particles|render_controllers)(?:\/|\\).*?[^\/\\]*\.json)/gmi;
		const fileMatch = fileRegex.exec(document.fileName);
		if (fileMatch && (fileMatch[1]?.length > 0)) {
			const addonPath = document.fileName.slice(0,document.fileName.length - fileMatch[1].length);
			if (addonPath != null) {
				const prefix = vscode.workspace.getConfiguration('molang-insert.typing').get('prefix');
				const string = findString(document, selection);
				if (string) insertMolangFile(addonPath, string, prefix);
			}
		}
	}
}

//# Inserting Molang File
/**
 * Function that handles the inserting trimmed Molang file code into the string selection.
 * @param {string} addonPath Path to the root of the pack, where the `molang` folder would be located.
 * @param {string} string Name of the Molang File.
 * @param {string} prefix Prefix the name must start with to confirm the insert.
 */
function insertMolangFile(addonPath, string, prefix) {
	if (string.text.startsWith(prefix) && string.text.endsWith('.molang')) {
		const molangFile = {
			name: '',
			path: '',
			text: ''
		};
		molangFile.name = string.text.substring(prefix.length);
		molangFile.path = path.join(addonPath, 'molang', molangFile.name);
		try {
			molangFile.text = fs.readFileSync(molangFile.path, 'utf8');
			molangFile.text = trimMolang(molangFile.text);
			
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
					editBuilder.replace(string.range, molangFile.text);
					vscode.window.showInformationMessage(`"${molangFile.name}" successfully inserted!`);
				})
			});
		} catch (error) {
			vscode.window.showInformationMessage(`"${molangFile.name}" can't be found!`);
		}
	}
}

//# Trimming Molang
const CommentTypes = {
	'none': -1,
	'inline': 0,
	'block': 1
};

/**
 * Algorithm to trim Molang source code text of comments and new lines.
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

		//### Molang string handling, comments don't work inside.
		if (char === quoteChar && inComment === CommentTypes.none) inString = !inString;
		if (inString) {
			if (char !== '\n' && char !== '\r') trimmedMolangString += char;
			continue;
		}

		let sliceToCompare;
		switch (inComment) {
			case CommentTypes.none:
				//### Inline Comments
				sliceToCompare = molangText.slice((index-inlineCommentChars.length)+1,index+1);
				if (sliceToCompare === inlineCommentChars) inComment = CommentTypes.inline;
				//### Single Character Inline Comments
				if (char === inlineCommentSingleChar) inComment = CommentTypes.inline;
				//### Block Comments
				sliceToCompare = molangText.slice((index-blockCommentChars[0].length)+1,index+1);
				if (sliceToCompare === blockCommentChars[0]) inComment = CommentTypes.block;
				//### String still isn't start of a comment.
				if (inComment === CommentTypes.none) {
					//### First "on hold" character isn't start of a comment, so it gets put "out of hold"
					if (holdChars.length === 1) {
						trimmedMolangString += holdChars[0];
						holdChars = holdChars.slice(1);
					}
					//### Character might be start of a comment, so it gets put "on hold".
					if (char === blockCommentChars[0][0] || char === inlineCommentChars[0]) {
						holdChars += char;
					}
					//### Nothing is "on hold", character can be safely returned.
					if (holdChars.length === 0 && char !== '\n' && char !== '\r') {
						trimmedMolangString += char;
					}
				} else {
					//### Reset characters "on hold", because the characters were start of a comment.
					holdChars = '';
				}
			break;
			case CommentTypes.inline:
				//### Inline comments break on a newline.
				if (char === '\n') {
					inComment = CommentTypes.none;
				}
			break;
			case CommentTypes.block:
				//### Block comments break on breaking characters.
				sliceToCompare = molangText.slice((index-blockCommentChars[1].length)+1,index+1);
				if (sliceToCompare === blockCommentChars[1]) {
					inComment = CommentTypes.none;
				}
			break;
		}
	}
	return trimmedMolangString;
}

//# Gettings String on the Line:
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

//# Other Stuff
function deactivate() { }

module.exports = {
	activate,
	deactivate
}