import { App, PluginSettingTab, Setting } from "obsidian";

import RegexExtractorPlugin from "./main";
// import { t } from "./lang/helper";

export interface RegexEctractorPluginSettings {
	parseParagraph: boolean;
}

export const DEFAULT_SETTINGS: RegexEctractorPluginSettings = {
    parseParagraph: false
}

export class RegexEctractorPluginSettingsTab extends PluginSettingTab {
	private plugin: RegexExtractorPlugin;

	constructor(app: App, plugin: RegexExtractorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

    public override display(): void {
		const { containerEl } = this;
		containerEl.empty();

        new Setting(containerEl)
        // für locale support, dann in den Strings jeweils t('Parse entire paragraph') nehmen
        .setName('Parse entire paragraph')
        .setDesc('Parses entire paragraph until next empty line when matched.')
        .addToggle(value => value
            .setValue(this.plugin.settings.parseParagraph)
            .onChange((value) => {
                this.plugin.settings.parseParagraph = value;
                this.plugin.saveSettings();
                this.plugin.app.workspace.trigger("file-open");
            })
        );
        }
}