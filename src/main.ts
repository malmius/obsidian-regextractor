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
		const ribbonIconEl = this.addRibbonIcon('scroll-text', 'Regex Extractor Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This should open the Regex Extractor View');
			this.activateView();
		});

		// Spezifische View registrieren
		this.registerView(VIEW_TYPES.DEFAULT_VIEW, (leaf) => new RegexExtractorView(leaf, this));

		// Wenn eine neue View geöffnet wird, wird die View aktualisiert
		// TEMPLATE: So wie hier sollte man auf die spezifischen Views referenzieren!
		this.registerEvent(this.app.workspace.on("file-open", () => {
			for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPES.DEFAULT_VIEW)) {
				const view = leaf.view;
				if (view instanceof RegexExtractorView) {
					view.reloadRegexExtractorViewDefault();
				}
			}
		}));
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
