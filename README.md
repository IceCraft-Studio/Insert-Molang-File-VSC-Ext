# Insert MoLang File \[Minecraft Bedrock\]

Very simple extension to make development on Minecraft Bedrock edition little more easier.

## Usage

To use this extension, simply type name of the MoLang file inside any string within an add-on file, you can optionally choose in settings of the extension that a prefix is required as well.  
String must follow this pattern and must not contain anything else: `"{prefix}{fileName}.molang"`  
If working in resource pack file it will only look into resource pack's `molang` folder and so with behavior packs.  
When it inserts the MoLang file's code, it removes any newlines or returns, so you don't have to worry about json errors!

**MoLang files in subfolders aren't supported, refer only to files in root folders!**
### Usage example:

![usage example](https://raw.githubusercontent.com/PavelDobCZ23/Insert-Molang-File-VSCode-Extension-/main/assets/example_usage.gif)

## Setup

 - Molang folder in your resource pack or behavior pack (*`[bp/rp]`*`\molang`) with MoLang files in it.
 - Any addon file to insert MoLang code into.


## Dependencies

This extension is dependent on working with `.molang` files and so [Blockception's Minecraft Bedrock Development Extension](https://marketplace.visualstudio.com/items?itemName=BlockceptionLtd.blockceptionvscodeminecraftbedrockdevelopmentextension) is installed with this extension as dependency for syntax colouring and auto completion of MoLang, however it has much more helpful features as well.

## Settings

* `molang-insert.prefix`: optional setting to set prefix

## Known Issues

So far no issues have been spotted.

#

This extension is made by Studio IceCraft
 - [Our Website!](https://www.icecraftstudio.repl.co) *WIP*
 - [Our Discord Server!](https://discord.com/invite/K28m8cKp74)
