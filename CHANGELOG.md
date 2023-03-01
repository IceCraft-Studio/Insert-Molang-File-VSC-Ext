# Change Log

## 1.0.0

- Initial release of the extension.

## 1.0.2

### Bug Fixes
- Biome files now insert MoLang as well.
- UNIX systems should now registre MoLang file directory correctly.

## 1.0.3

### Features
- *New condition!* - Now either one of those keywords must be present in the root pack folder's name (`bp`,`rp`,`beh`,`res`,`behavior`,`resource`) or the root pack folder must be in folder which name ends with `behavior_packs` or `resource_packs` in order for the molang insertation to work.  
*This change's been made so that the feature is restricted to Minecraft add-on workspace.*

## 2.0.0

### Features
- *Actual UI for selecting the files!* - Now you can right click on a string or use the command pallete to bring **Insert MoLang File** menu which lets you select the files instead of typing their name inside the string, it doesn't matter if the string is empty or not it will simply replace it completely with contents of selected MoLang file without whitespace characters.
  
- New setting `molang-insert.fileSorting` - sets the order of files in the menu, either sorted by date modified or alphabetically.

### Changes
- Because of the UI addition, now legacy way of using the extension is toggleable using `molang-insert.typing.enabled` setting, which you might turn off if you would like you.

### Bug Fixes
- Certain files will no longer throw errors.

## 2.1.0

### Features
- Comments are now possible inside of MoLang files, single-line using `#` or `//` and multi-line using `/*` and `*/`.

### Other
- Removed some unnecessary code.

## 2.1.1

### Bug Fixes
- Client entity files no longer send false error messages.

## 2.2.0

### Bug Fixed
- Fixed uncaught errors with `selection`.

### Other
- Changed the source code's license to a more viable solution.
- Removed unnecessary dependancy on [Blockception's Minecraft Bedrock Development](https://marketplace.visualstudio.com/items?itemName=BlockceptionLtd.blockceptionvscodeminecraftbedrockdevelopmentextension).