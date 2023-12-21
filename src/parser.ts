import RegexExtractorPlugin from "./main";
import { VIEW_TYPES, REGEX_EXPRESSIONS } from './constants';
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
        const dataViewFieldsArray = [];
        for (const fieldName of Object.keys(field)) {
            console.log(fieldName);
            dataViewFieldsArray.push(fieldName);
        }
        console.log(field);
        return dataViewFieldsArray;
    }
}

export class FieldsParser extends Parser {
    dataviewAPI;

	constructor(plugin: RegexExtractorPlugin) {
		super(plugin);
        this.dataviewAPI = getAPI(plugin.app);
    }

    async getActiveFileLines(): Promise<string[]> {
        const activeFile = this.plugin.app.workspace.getActiveFile();
        let lines: string[] = [];
        if (activeFile) {
            const activeFileContent = await this.plugin.app.vault.cachedRead(activeFile);
            if (activeFileContent) {
                lines = activeFileContent.split("\n");
            }
        }
        return lines;
    }

    returnFieldMatches(lines: string[]): RegexExtract[] {
        const matches = new RegExp(REGEX_EXPRESSIONS.FIELDS_ROUNDBRACKETS, "m");
        const extracts: RegexExtract[] = [];
        
        for (let i = 0; i < lines.length; i++) { // Read filecontent line by line
            const line = lines[i]; // current line
            if (matches.test(line)) {
                const newExtract = new RegexExtract(i, line);
                extracts.push(newExtract);
            }
        }
        return extracts;
    }

    async parseFields(): Promise<RegexExtract[]> {
        const fileLines = await this.getActiveFileLines();
        const parsedExtracts = this.returnFieldMatches(fileLines);
        console.log(parsedExtracts);

        return parsedExtracts;
    }
}

class RegexExtract {
    lineNumber: number;
    parsedContent: string;

    constructor(lineNumber: number, parsedContent: string) {
        this.lineNumber = lineNumber;
        this.parsedContent = parsedContent;
    }

    toString() {
        return `linenumber: ${this.lineNumber}, content: ${this.parsedContent}`
    }
}