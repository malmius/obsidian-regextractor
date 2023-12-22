import RegexExtractorPlugin from "./main";
import { VIEW_TYPES, REGEX_EXPRESSIONS } from './constants';
import { getAPI, Values } from "obsidian-dataview";
import { table } from "console";

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
        if (activeFile) {
            const activeFileContent = this.plugin.app.vault.cachedRead(activeFile);
        }
        const field = this.dataviewAPI.page(activeFile?.name);
        const dataViewFieldsArray = [];
        for (const fieldName of Object.keys(field)) {
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

    async getLinesOfActiveFile(): Promise<string[]> {
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
        const regExpression = new RegExp(REGEX_EXPRESSIONS.FIELDS_ROUNDBRACKETS, "m");
        const extracts: RegexExtract[] = [];
        
        for (let i = 0; i < lines.length; i++) { // Read filecontent line by line
            const line = lines[i]; // current line
            const matches = line.match(regExpression);
            if (matches) {
                console.log("match: " + matches);
                const newExtract = new RegexExtract(i, ['total', 'fieldname', 'fieldcontent'], matches);
                extracts.push(newExtract);
            }
        }
        return extracts;
    }

    async parseFields(): Promise<RegexExtract[]> {
        const fileLines = await this.getLinesOfActiveFile();
        const parsedExtracts = this.returnFieldMatches(fileLines);
        return parsedExtracts;
    }
}

class RegexExtract {
    lineNumber: number;
    regExMap: string[];
    matches: string[];

    constructor(lineNumber: number, regExMap: string[], matches: string[]) {
        this.lineNumber = lineNumber;
        this.regExMap = regExMap;
        this.matches = matches;
    }

    toTableLine(filter?: string): Element {
        const tableRow = document.createElement("tr");

        // linenumber
        const columnLineNumber = document.createElement("td");
        columnLineNumber.innerHTML = this.lineNumber.toString();
        tableRow.appendChild(columnLineNumber);

        // parsedelement
        const columnParsedContent = document.createElement("td");
        columnParsedContent.innerHTML = this.matches[2];
        tableRow.appendChild(columnParsedContent);
        return tableRow;
    }

    toString() {
        return `linenumber: ${this.lineNumber}, matches: ${this.matches}`
    }
}