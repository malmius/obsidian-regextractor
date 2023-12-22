import RegexExtractorPlugin from "./main";
import { REGEX_TYPES, RegexType} from './constants';
import { getAPI } from "obsidian-dataview";

abstract class Parser {
	public plugin: RegexExtractorPlugin;

	constructor(plugin: RegexExtractorPlugin) {
		this.plugin = plugin;
	}

    abstract parseFields(): Promise<ParsedExtract[]>;

    abstract getDistinctFieldNames(fieldsArray: ParsedExtract[]): string[];

    abstract returnFieldMatches(lines: string[]): ParsedExtract[];

    protected async getLinesOfActiveFile(): Promise<string[]> {
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
}

export class FieldsParser extends Parser {
    dataviewAPI;

	constructor(plugin: RegexExtractorPlugin) {
		super(plugin);
        this.dataviewAPI = getAPI(plugin.app);
    }

    returnFieldMatches(lines: string[]): ParsedExtract[] {
        const regExpression = new RegExp(REGEX_TYPES.FIELD_ROUNDBRACKETS.regEx, "m");
        const extracts: ParsedExtract[] = [];
        
        for (let i = 0; i < lines.length; i++) { // Read filecontent line by line
            const line = lines[i]; // current line
            const matches = line.match(regExpression);
            if (matches) {
                console.log("match: " + matches);
                const newExtract = new ParsedExtract(i, REGEX_TYPES.FIELD_ROUNDBRACKETS, matches);
                extracts.push(newExtract);
            }
        }
        return extracts;
    }

    async parseFields(): Promise<ParsedExtract[]> {
        const fileLines = await this.getLinesOfActiveFile();
        const parsedExtracts = this.returnFieldMatches(fileLines);
        return parsedExtracts;
    }

    getDistinctFieldNames(fieldsArray: ParsedExtract[]): string[] {
        const distinctFieldNames: string[] = [];
        fieldsArray.forEach((regexExtract) => {
            const titleIndex = regexExtract.regExType.titleGroupIndex;
            const fieldname = regexExtract.matches[titleIndex].toLowerCase();
            if (!distinctFieldNames.includes(fieldname)) {
                distinctFieldNames.push(fieldname);
            }
        })
        return distinctFieldNames;
    }
}

class ParsedExtract {
    lineNumber: number;
    regExType: RegexType;
    matches: string[];

    constructor(lineNumber: number, regExType: RegexType, matches: string[]) {
        this.lineNumber = lineNumber;
        this.regExType = regExType;
        this.matches = matches;
    }

    toTableLine(filter?: string): Element | null {
        console.log('tablefilter: ' + filter);
        if (filter) {
            const filterLowerCase = filter.toLowerCase();
            if (!this.matches[this.regExType.titleGroupIndex].toLowerCase().includes(filterLowerCase)) {
                return null;
            }
        }
        const tableRow = document.createElement("tr");

        // linenumber
        const columnLineNumber = document.createElement("td");
        columnLineNumber.innerHTML = this.lineNumber.toString();
        tableRow.appendChild(columnLineNumber);

        // parsedelement
        const columnParsedContent = document.createElement("td");
        columnParsedContent.innerHTML = this.matches[this.regExType.contentGroupIndex];
        tableRow.appendChild(columnParsedContent);
        return tableRow;
    }

    toString() {
        return `linenumber: ${this.lineNumber}, matches: ${this.matches}`
    }
}