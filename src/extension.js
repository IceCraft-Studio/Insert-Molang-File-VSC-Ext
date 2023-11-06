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
//var output = vscode.window.createOutputChannel("Molang-Insert");

//Activation of the Extension:
function activate(context) {
	console.log('Insert MoLang File [Minecraft Bedrock] - Loaded');

	//Command and Context Manu Insert:
	context.subscriptions.push(
		vscode.commands.registerCommand('molang-insert.openUi', () => molangInsertUi())
	);

	//Typing Insert:
	const typingEnabled = vscode.workspace.getConfiguration('molang-insert.typing').get('enabled');
	if (typingEnabled) {
		context.subscriptions.push(
			vscode.workspace.onDidChangeTextDocument(event => textDocumentChange(event))
		);
	}
}

function molangInsertUi() {
	const textEditor = vscode.window.activeTextEditor;
	const document = textEditor?.document;
	const selection = textEditor?.selection;
	if (document == null || selection == null) {
		vscode.window.showInformationMessage(`Text editor isn't open!`);
		return;
	}

	var panel = vscode.window.createWebviewPanel(
		'molang-insert',
		'Insert MoLang File',
		textEditor.viewColumn,
		{
			enableScripts: true
		}
	);

	const fileRegex = /(.*)(?:subpacks|features|biomes|feature_rules|entities|entity|scripts|blocks|items|trading|loot_tables|animations|animation_controllers|recipes|spawn_rules|functions|attachables|fogs|materials|particles|render_controllers|shaders|sounds|ui|models|library)(?:[\/\\].*?[^\/\\]*\.json)/gmi
	const fileMatch = fileRegex.exec(document.fileName);
	if (fileMatch === null) {
		panel.dispose();
		vscode.window.showInformationMessage(`Can't identify this as behavior/resource pack file!`);
		return;
	}

	const string = findString(document, selection);
	if (string === null) {
		panel.dispose();
		vscode.window.showInformationMessage(`Your cursor isn't targeting a string!`);
		return;
	}

	const addonPath = fileMatch[1];
	panel.webview.html = generateUiContent(addonPath, panel);

	panel.onDidChangeViewState(event => {
		if (event.webviewPanel.visible === false) {
			panel.dispose();
		}
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

//MoLang Insert UI Generator:
function generateUiContent(addonPath, panel) {
	const molangFolder = path.join(addonPath, 'molang');
	let files = {};
	let fileItems = '';
	let length = 99;

	//File Info:
	try {
		fs.readdirSync(molangFolder).forEach(file => {
			if (file.endsWith('.molang')) {
				const filePath = path.join(molangFolder, file);
				files[file] = {};
				files[file].date = fs.statSync(filePath).mtime;
				const fileContents = fs.readFileSync(filePath, 'utf8');
				if (fileContents.length < 100) {
					length = fileContents.length;
				}
				files[file].preview = fs.readFileSync(filePath, 'utf8').substring(0, length).replace(/(?:(?:#|\/\/)[^\n\r\f]*)|(?:\/\*(?:.|[\n\r\f])*\*\/)/gmi, '').replace(/[\n\r\f]/gmi, '');;
			}
		});
	} catch {
		panel.dispose();
		vscode.window.showInformationMessage(`Molang folder can't be found within current behavior/resource pack!`);
		return
	}

	//File List:
	if (Object.keys(files).length != 0) {
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
			const dateModified = files[file].date.toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
			const fileName = file;
			fileItems += `<div class="file-item" onclick="sendMessage('file','${fileName}');"> <span class="name">${fileName}</span> <div class="preview">${preview}</div> <span class="date-modified"><i>Date modified: ${dateModified}</i></span> </div>`;
		}
	} else {
		panel.dispose();
		vscode.window.showInformationMessage(`Molang folder doesn't have any MoLang files inside!`);
		return;
	}
	const htmlCode = `<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>Insert MoLang File</title> </head> <style> * { color: var(--vscode-foreground); } .file-item { width: 25rem; background-color: var(--vscode-sideBar-background); padding: 7px; margin-bottom: 0px; box-sizing: border-box; } .file-item:hover { background-color: var(--vscode-list-hoverBackground); outline: 1px dashed var(--vscode-toolbar-hoverOutline); outline-offset: -1px; user-select: none; cursor: pointer; } .file-item .preview { font-family: var(--vscode-font-family); font-size: 110%; padding-right: 11px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; } .file-item .name { font-family: var(--vscode-font-family); font-size: 110%; padding-right: 11px; font-weight: 700; } .file-item .date-modified { font-size: 90%; font-weight: 600; padding-right: 11px; font-family: var(--vscode-font-family); } .file-item .no-file { font-family: var(--vscode-font-family); font-size: 150%; font-weight: 700; } </style> <script> const vscode = acquireVsCodeApi(); function sendMessage(command, text) { vscode.postMessage({ command: command, text: text }); } </script> <body> <p><i>Leave this tab to close.</i></p> <h1>Insert MoLang File</h1> <p>Choose a file from the list of files found here:</p> <div> ${fileItems} </div> <p><b>DIRECTORY: </b><code>${molangFolder}</code></p> </body> </html>`;
	return htmlCode;
}

//Typing Insert Trigger:
function textDocumentChange(event) {
	let file = {};
	const document = event.document;
	const textEditor = vscode.window.activeTextEditor;
	const selection = textEditor?.selection;
	if (selection == null) return;

	file.name = document.fileName;

	if ((file.name.endsWith('.json') || file.name.endsWith('.js')) && selection.isSingleLine) {
		const fileRegex = /((?:.*[\/\\][^\/\\]*(?:(?:resource(?:\s|_|-)packs)|(?:behavior(?:\s|_|-)packs))[\/\\][^\/\\]*[\/\\])|(?:.*[\/\\][^\/\\]*(?:(?:beh\b)|(?:res\b)|(?:bp)|(?:rp)|(?:resource)|(?:behavior))[^\/\\]*[\/\\]))(?:subpacks|features|biomes|feature_rules|entities|scripts|blocks|items|trading|loot_tables|animations|animation_controllers|recipes|spawn_rules|functions|attachables|fogs|materials|particles|render_controllers|shaders|sounds|ui|models|library)(?:[\/\\].*?[^\/\\]*\.json)/gmi
		const fileMatch = fileRegex.exec(file.name);
		if (fileMatch) {
			file.path = fileMatch[0];
			file.addonPath = fileMatch[1];
			if (typeof file.addonPath !== "undefined") {
				const prefix = vscode.workspace.getConfiguration('molang-insert.typing').get('prefix');
				const string = findString(document, selection);
				if (string) insertMolangFile(file.addonPath, string, prefix);
			}
		}
	}
}

//MoLang Insert:
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
			molangFile.text = molangFile.text.replace(/(?:(?:\/\/)[^\n\r\f]*)|(?:\/\*(?:.|[\n\r\f])*\*\/)/gmi, '').replace(/[\n\r\f]/gmi, '');
			function editText() {
				return new Promise(waitForEditor);
				function waitForEditor(resolve, reject) {
					if (vscode.window.activeTextEditor !== undefined) {
						resolve(vscode.window.activeTextEditor);
					} else {
						setTimeout(waitForEditor.bind(this, resolve, reject), 100);
					}
				}
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

//Gettings String on the Line:
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

//Other Extension Related Stuff:
function deactivate() { }

module.exports = {
	activate,
	deactivate
}