import { App, PluginSettingTab, Setting } from "obsidian";

import RegexExtractorPlugin from "./main";
// import { t } from "./lang/helper";

export interface RegexEctractorPluginSettings {
	parseParagraph: boolean;
    ignoreFieldsList: string;
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

        new Setting(containerEl)
        .setName('Ignore Fields')
        .setDesc('Ignose these DataviewFields from Extractor View')
        .addTextArea(ignoreFieldsList => ignoreFieldsList
            .setValue(this.plugin.settings.ignoreFieldsList)
            .onChange((ignoreFieldsList) => {
                this.plugin.settings.ignoreFieldsList = ignoreFieldsList;
                this.plugin.saveSettings();
                this.plugin.app.workspace.trigger("file-open");
            })
        )}
}

export function getArrayFromText(text:string, separator:string): string[] {
    let valuesArray: string[] = []
    if (text != '') {
        if (text.contains(',')) {
            valuesArray = text.split(separator);
        }
        else {
            valuesArray.push(text);
        }
    }
    return valuesArray;
}