# Insert Molang File \[Minecraft Bedrock\]

Very simple extension to make development of Minecraft: Bedrock Edition packs a little more comfortable,
it gives you options to insert `.molang` files into `.json` files without a problem.

## Usage

- To use this extension, **right click** (you can also use command pallete) in any string (i.e. between double quotes)
inside a `.json` addon file, a menu will pop up and you can select any `.molang` file from the `molang` folder you
want to insert. It doesn't matter if the string is empty or contains text, it will simply replace it completely.
- There is an alternative way to insert molang files by typing their name (or path when they are in a subfolder)
alone inside a string - "typing mode". This can be disabled or optionally set to require a prefix in the settings.
- **The `molang` folder must be located in the same folder as the `manifest.json` file!** If you're working in
resource pack file it will search the resource pack's `molang` folder and so with behavior packs.
- You can have molang files inside subfolders of the `molang` folder and they will be detected.
- When it inserts the molang file's code, it removes any newlines or returns and comments, so you don't have to
worry about json errors! Strings with newlines inside `.json` files cause errors, this is to prevent that
while keeping a comfortable developer experience and even allows comments to be used!
- Comments are supported within molang files like so: single-line comments using `//<comment>` or `#<comment>`
and multi-line comments using `/*<comment>*/`. They will be ignored and won't be inserted.

## Attention

- Molang files in subfolders aren't supported, refer only to files in pack's root folder!
- `molang` folder is case-sensitive, make sure it's all lower-case letters!
- The extension automatically looks for the pack's root path by finding the path closest to the root of the file system,
that contains a folder with keyword like `features` or `entities`. Make sure folders with keywords don't exist
anywhere in the path leading to the pack's root, only **inside** the pack's root, not before!

## Fix for the problem "Molang folder can't be found in the pack!"

- Example of this problem with such file path: `C:\Minecraft\Development\biomes\My addon BP\features\test.json`.
- You have your molang files inside folder at: `C:\Minecraft\Development\biomes\My addon BP\molang\`.
- However the extension will expect your pack's root to be located at `C:\Minecraft\Development\`, even if you intent
it to be `C:\Minecraft\Development\biomes\My addon BP\`, because it contains the keyword `biomes` before that.

### 1. Solution - Rename the folder with keyword that's outside of the pack's root

- This fix involves replacing the `biomes` folder, mentioned in the example, with something else like `Custom Biomes`,
which isn't a keyword.
- List of folder keywords: `subpacks,features,biomes,feature_rules,entities,entity,blocks,items,animations,animation_controllers,attachables,particles,render_controllers`

### 2. Solution - Override the addon root folder, disable automatic detection

- If you don't want to rename any folder in the path, you can still fix the problem by overriding the root path of your packs
in the extension [settings](https://code.visualstudio.com/docs/getstarted/settings). This disables the automatic detection of
the pack's root path. It is recommended to [setup a workspace](https://code.visualstudio.com/docs/editor/workspaces) to apply
the settings for each project individually.

## Usage example

![usage example](https://raw.githubusercontent.com/PavelDobCZ23/Insert-Molang-File-VSCode-Extension-/main/assets/example_usage.gif)

## Setup

- `molang` folder in your resource pack or behavior pack, with molang files in it (can use subfolders too).
- Any `.json` addon file to insert molang code into.

## Dependencies

This extension does not have any dependencies.

## Settings

- `molang-insert.behaviorPackPath`: override root path of the behavior pack's folder
- `molang-insert.resourcePackPath`: override root path of the resource pack's folder
- `molang-insert.fileSorting`: set how are the files sorted in the menu
- `molang-insert.typing.enabled`: checkbox to enable  typing mode - inserting molang files by typing their name/path alone into a string
(optionally with a prefix)
- `molang-insert.typing.prefix`: optional setting to set prefix when using typing mode
- More details are explained within VSCode settings.

## Typing Mode Usage Example

![usage example legacy](https://raw.githubusercontent.com/PavelDobCZ23/Insert-Molang-File-VSCode-Extension-/main/assets/example_usage_legacy.gif)

## Known Issues

There are no issues we are aware of.

## Finishing up

This extension is made by **Studio IceCraft**
The license is present in `LICENSE.md` file.

- [Our Website!](https://www.icecraftstudio.repl.co) *WIP*
- [Our Discord Server!](https://discord.com/invite/K28m8cKp74)

\
*Not affiliated with Mojang or Microsoft*

**Minecraft is an IP owned by Microsoft. Molang is a part of this IP and all legal rights to those subjects
belong to Microsoft.**
