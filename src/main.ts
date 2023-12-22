import { Editor, MarkdownView, Notice, Plugin } from 'obsidian';
import { VIEW_TYPES } from './constants';

import { RegexEctractorPluginSettingsTab, RegexEctractorPluginSettings, DEFAULT_SETTINGS } from './settings'
import { RegexExtractorView } from './views';

// Remember to rename these classes and interfaces!


export default class RegexExtractorPlugin extends Plugin {
	settings: RegexEctractorPluginSettings;

	async onload() {
		await this.loadSettings();
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new RegexEctractorPluginSettingsTab(this.app, this));

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Regex Extractor Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This should open the Regex Extractor View');
			this.activateView();
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		this.registerView(VIEW_TYPES.DEFAULT_VIEW, (leaf) => new RegexExtractorView(leaf, this));

		// Wenn eine neue View geöffnet wird, wird die View aktualisiert
		// TEMPLATE: So wie hier sollte man auf die spezifischen Views referenzieren!
		this.registerEvent(this.app.workspace.on("file-open", () => {
			for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPES.DEFAULT_VIEW)) {
				const view = leaf.view;
				if (view instanceof RegexExtractorView) {
					view.reloadRegexExtractorView();
				}
			}

		}));

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

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private async activateView() {
		if (this.app.workspace.getLeavesOfType(VIEW_TYPES.DEFAULT_VIEW).length) {
			const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPES.DEFAULT_VIEW)[0];
			this.app.workspace.revealLeaf(leaf);
		} else {
			const leaf = this.app.workspace.getRightLeaf(false);
			await leaf.setViewState({ type: VIEW_TYPES.DEFAULT_VIEW, active: true });
			this.app.workspace.revealLeaf(leaf);
		}
	}
}
