# Obsidian Regex Extractor

## Development

Install modules:
```bash
npm install
```

Build Javascript in Dev mode:
```bash
npm run dev
```

Build Javascript once:
```bash
npm run build
```

## Roadmap

- [ ] Weitere Regex hinzufügen (weitere Fields, Highlights)
- [ ] Link zur Editor Position

### Adjustments

- esbuild.config.mjs muss einen gültigen Pfad haben für den Entrypoint (wenn man das main.ts verschiebt, muss man es anpassen)

### Dataview

Link zur Doku: https://blacksmithgu.github.io/obsidian-dataview/resources/develop-against-dataview/

### Learnings
- Wenn man hier containerEl nimmt anstatt contentEl, ist es auf gleicher Höhe mit den anderen und verschwindet.

### Ressourcen
- Icons, die in Obsidian verwendet werden: https://lucide.dev

### Snippets
```
		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

        		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						console.log('executes something')
						//new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});
```

In der `onload()` Funktion:

```
        // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
```

#### View

```
    // Beispiel Menü-Item
    public onPaneMenu(menu: Menu): void {
		menu.addItem((item) => {
			item.setTitle("CLOSE")
				.setIcon("cross")
				.onClick(() => {
					this.app.workspace.detachLeavesOfType(VIEW_TYPES.DEFAULT_VIEW);
				});
		});
	}
```

#### Access Dataview

```
        this.dataviewAPI = getAPI(plugin.app);
        const activeFile = this.plugin.app.workspace.getActiveFile();
        const field = this.dataviewAPI.page(activeFile?.name);
```