import { MarkdownRenderer } from "obsidian";
import RegexExtractorPlugin from "./main";
import { REGEX_TYPES, RegexType, getRegexTypeNames} from './constants';
import { getAPI } from "obsidian-dataview";
import { title } from "process";

export class Parser {
	public plugin: RegexExtractorPlugin;

	constructor(plugin: RegexExtractorPlugin) {
		this.plugin = plugin;
	}

    async parseFields(regexType: RegexType): Promise<ParsedExtract[]> {
        const fileLines = await this.getLinesOfActiveFile();
        const parsedExtracts = this.returnFieldMatches(regexType, fileLines);
        return parsedExtracts;
    }

    getDistinctFieldNames(fieldsArray: ParsedExtract[]): string[] {
        const distinctFieldNames: string[] = [];
        fieldsArray.forEach((regexExtract) => {
            let fieldName: string;
            const titleIndex = regexExtract.regExType.titleGroupIndex;
            if (titleIndex == -1) {
                fieldName = regexExtract.regExType.type;
                distinctFieldNames.push(fieldName);
            }
            else {
                fieldName = regexExtract.matches[titleIndex].toLowerCase();
                if (!distinctFieldNames.includes(fieldName)) {
                    distinctFieldNames.push(fieldName);
                }
            }
        })
        return distinctFieldNames;
    }
    returnFieldMatches(regexType: RegexType, lines: string[]): ParsedExtract[] {
        const regExpression = new RegExp(regexType.regEx, "gm");
        const extracts: ParsedExtract[] = [];
        
        for (let i = 0; i < lines.length; i++) { // Read filecontent line by line
            const line = lines[i]; // current line
            const matches = line.matchAll(regExpression);
            if (matches) {
                for (const match of matches) {
                    // console.log("match: " + match);
                    const newExtract = new ParsedExtract(i, regexType, match);
                    extracts.push(newExtract);
                }
            }
        }
        return extracts;
    }
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
        // console.log('tablefilter: ' + filter);
        if (filter) {
            const filterLowerCase = filter.toLowerCase();
            if (!getRegexTypeNames().includes(filterLowerCase)) {
                if (!this.matches[this.regExType.titleGroupIndex]?.toLowerCase().includes(filterLowerCase)) {
                    return null;
                }
            }
        }
        const tableRow = document.createElement("tr");

        // linenumber
        const columnLineNumber = document.createElement("td");
        columnLineNumber.innerHTML = this.lineNumber.toString();
        tableRow.appendChild(columnLineNumber);

        // parsedelement
        const columnParsedContent = document.createElement("td");
        const contentString = this.matches[this.regExType.contentGroupIndex];

        // columnParsedContent.createSpan("extractor-element-text"), (el) => {MarkdownRenderer.render(this.plugin.app, contentString, el, this.plugin.)};
        columnParsedContent.innerHTML = contentString;
        tableRow.appendChild(columnParsedContent);
        return tableRow;
    }

    toString() {
        return `linenumber: ${this.lineNumber}, matches: ${this.matches}`
    }
}