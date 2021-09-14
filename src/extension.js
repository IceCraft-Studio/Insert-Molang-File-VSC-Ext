const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
	console.log('Insert MoLang File [Minecraft] - Loaded');

	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(event => textDocumentChange(event))
	);
}

function textDocumentChange(event) {
	let file = {};
	const document = event.document;
	const textEditor = vscode.window.activeTextEditor;
	const selection = textEditor.selection;
	file.name = document.fileName;

	if ((file.name.endsWith('.json') || fileName.endsWith('.js')) && selection.isSingleLine) {
		const fileRegex = /((?:.*[\/\\][^\/\\]*(?:(?:resource(?:\s|_|-)packs)|(?:behavior(?:\s|_|-)packs))[\/\\][^\/\\]*[\/\\])|(?:.*[\/\\][^\/\\]*(?:(?:beh\b)|(?:res\b)|(?:bp)|(?:rp)|(?:resource)|(?:behavior))[^\/\\]*[\/\\]))(subpacks|features|biomes|feature_rules|entities|scripts|blocks|items|trading|loot_tables|animations|animation_controllers|recipes|spawn_rules|functions|attachables|fogs|materials|particles|render_controllers|shaders|sounds|ui|models|library)([\/\\].*?[^\/\\]*\.json)/gmi
		const fileMatch = fileRegex.exec(file.name);
		file.path = fileMatch[0];
		file.addonPath = fileMatch[1];
		file.addonFolder = fileMatch[2];
		file.folderPath = fileMatch[3];
		if (typeof file.addonPath !== "undefined") {
			const string = findString(document, selection);
			const prefix = vscode.workspace.getConfiguration('molang-insert').get('prefix');
			if (string !== null) {
				if (string.text.startsWith(prefix) && string.text.endsWith('.molang')) {
					let molangFile = {
						name: '',
						path: '',
						text: ''
					}
					molangFile.name = string.text.substring(prefix.length);
					molangFile.path = path.join(file.addonPath, 'molang', molangFile.name);
					try {
						molangFile.text = fs.readFileSync(molangFile.path, 'utf8');
						molangFile.text = molangFile.text.replace(/[\n\r\f]/gm, '');
						textEditor.edit(editBuilder => {
							editBuilder.replace(string.range, molangFile.text)
						});
						vscode.window.showInformationMessage(`"${molangFile.name}" successfully inserted!`);
					}
					catch {
						vscode.window.showInformationMessage(`"${molangFile.name}" can't be found!`);
					}
				}
			}
		}
	}
}

function findString(document, selection) {
	const line = document.lineAt(selection.start.line);
	const stringRegex = /"(.*?)(?<!\\)"/g;

	while (regexArray = stringRegex.exec(line.text)) {
		let start = regexArray.index + 1;
		let end = start + regexArray[1].length;

		if (start - 1 < selection.start.character && selection.start.character < end + 1) {
			const text = line.text.substring(start, end);
			const range = new vscode.Range(
				new vscode.Position(selection.start.line, start),
				new vscode.Position(selection.start.line, end)
			);
			return {
				text,
				range
			}
		}
		else {
			continue
		}
	}
	return null;
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
