# Obsidian Regextractor

This plugin allows for browsing special parts of a file in Obsidian. Parts are identified by a specific syntax, e.g. Dataview Fields are usually written like `[key:: value]` or `(key:: value)`. The same goes for other text elements.

The Regextractor plugin allows for extracting these text parts and displaying them in a side panel. Each extract is displayed as a card and can be filtered by type, label and search string.

## Extract Types
**Regular Cards** show the text of the extract, the type and the corresponding line number. Clicking on the line number jumps to the corresponding position in the active document.

![Regular Cards Image](./assets/regular-cards-display.png)

**Front and Back Cards** show text in the front and back of the card. When clicking on the card, the card turns around.

![Front Back Card](./assets/front-back-card-display.gif)

## Why this plugin?
I usually "annotate" my notes with many symbools (e.g. Dataview Fields, Highlights, Flashcards etc.). For large files, these are difficult to overview.

## Roadmap
- [ ] Set relevant Regex Types in Settings (to not show all available types in the dropdown menu)
- [ ] Define custom regex types
- [ ] Allow filtering of files in entire vault, not just active file

## Disclaimer
This plugin is in early development. Please make sure to backup your vault when using it.