# Insert MoLang File \[Minecraft Bedrock\]

Very simple extension to make development on Minecraft Bedrock edition little more easier, it gives you options to insert `.molang` files into `.json` files without a problem.

## Usage

To use this extension, simply right click *(you can also use command pallete)* on any string within an add-on file, a menu will pop up and you can select whichever file from molang folder you want to insert. It doesn't matter if the string is empty or not, it will simply replace it completely.
If working in resource pack file it will only look into resource pack's `molang` folder and so with behavior packs.  
When it inserts the MoLang file's code, it removes any newlines or returns, so you don't have to worry about json errors!  
Comments are supported within MoLang files like so: single-line comments using `#<comment>` or `//<comment>` and multi-line comments using `/*<comment>*/`. They will be ignored and won't be inserted.

**MoLang files in subfolders aren't supported, refer only to files in root folders!**
### Usage example:

![usage example](https://raw.githubusercontent.com/PavelDobCZ23/Insert-Molang-File-VSCode-Extension-/main/assets/example_usage.gif)

## Setup

 - Molang folder in your resource pack or behavior pack (*`[BP/RP]`*`\molang`) with MoLang files in it.
 - Any addon file to insert MoLang code into.

## Dependencies

This extension does not have any dependencies.

## Settings

- `molang-insert.fileSorting`: set how files will be sorted in the menu
- `molang-insert.typing.enabled`: set to `true` if you want to insert molang files by typing their name alone into a string (optionally with a prefix)
- `molang-insert.typing.prefix`: optional setting to set prefix when using typing option mentioned above

*More details are explained within VSCode settings.*
  
*When using the option to insert MoLang files by typing their name, make sure that either one of those keywords is present in the pack folder's name (`bp`,`rp`,`beh`,`res`,`behavior`,`resource`) or the pack folder is in a folder which name ends with `behavior_packs` or `resource_packs`!*

*Usage example of inserting MoLang file by typing its name:*

![usage example legacy](https://raw.githubusercontent.com/PavelDobCZ23/Insert-Molang-File-VSCode-Extension-/main/assets/example_usage_legacy.gif)

## Known Issues

So far no issues have been spotted.

#

This extension is made by **Studio IceCraft**
 - [Our Website!](https://www.icecraftstudio.repl.co) *WIP*
 - [Our Discord Server!](https://discord.com/invite/K28m8cKp74)

\
*Not affiliated with Mojang or Microsoft*

***Minecraft is an IP owned by Microsoft and Molang is a part of this IP, all legal rights to those subjects belong to them.***