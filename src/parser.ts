import RegexExtractorPlugin from "./main";
import { VIEW_TYPES } from './constants';
import { getAPI, Values } from "obsidian-dataview";

abstract class Parser {
	public plugin: RegexExtractorPlugin;

	constructor(plugin: RegexExtractorPlugin) {
		this.plugin = plugin;
	}
}

export class DataviewParser extends Parser {
    dataviewAPI;

	constructor(plugin: RegexExtractorPlugin) {
		super(plugin);
        this.dataviewAPI = getAPI(plugin.app);
    }

    returnDataviewFieldNames(): string[] {
        const activeFile = this.plugin.app.workspace.getActiveFile();
        console.log('active file:')
        console.log(activeFile);
        if (activeFile) {
            const activeFileContent = this.plugin.app.vault.cachedRead(activeFile);
            console.log('active file content:')
            console.log(activeFileContent)
        }
        console.log('printing dataview API');
        console.log(this.dataviewAPI);
        const field = this.dataviewAPI.page(activeFile?.name);
        for (const fieldName of Object.keys(field)) {
            console.log(fieldName);
        }
        console.log(field);
        return [''];
    }
}

class RegexExtract {
    lineNumber: number;
    parsedGroups: string[];
    tags: string[]

    constructor(lineNumber: number, parsedGroups: string[]) {
        this.lineNumber = lineNumber;
        this.parsedGroups = parsedGroups;
    }
}