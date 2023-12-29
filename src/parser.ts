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
        let parsedExtracts: Promise<ParsedExtract[]>;
        if (regexType.matchByLine) {
            const fileLines = await this.getLinesOfActiveFile();
            parsedExtracts = this.returnFieldMatchesByLine(regexType, fileLines);
        } else {
            const activeFile = await this.getContentOfActiveFile();
            parsedExtracts = this.returnFieldMatchesByFile(regexType, activeFile);
        }
        return parsedExtracts;
    }

    async getDistinctFieldNames(fieldsArray: ParsedExtract[]) {
        const distinctFieldNames = {};
        fieldsArray.forEach((regexExtract) => {
            const type = regexExtract.regExType.type;
            if (!distinctFieldNames[type]) {
                distinctFieldNames[type] = [];
            }
            const fieldName = ParsedExtract.normalizeString(regexExtract.getName());
            if (!distinctFieldNames[type].includes(fieldName)) {
                distinctFieldNames[type].push(fieldName);
            }
        })
        return distinctFieldNames;
    }

    returnFieldMatchesByLine(regexType: RegexType, lines: string[]): ParsedExtract[] {
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

    returnFieldMatchesByFile(regexType: RegexType, fileContent: string): ParsedExtract[] {
        const regExpression = new RegExp(regexType.regEx, "gm");
        const extracts: ParsedExtract[] = [];
        
        const matches = fileContent.matchAll(regExpression);
        if (matches) {
            for (const match of matches) {
                // console.log("match: " + match);
                const lineNumber = this.getLineNumberOfCharIndex(fileContent, match.index);
                const newExtract = new ParsedExtract(lineNumber, regexType, match);
                extracts.push(newExtract);
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

    protected async getContentOfActiveFile(): Promise<string> {
        const activeFile = this.plugin.app.workspace.getActiveFile();
        const activeFileContent = await this.plugin.app.vault.cachedRead(activeFile);
        return activeFileContent;
    }

    private getLineNumberOfCharIndex(fileContent, charIndex): number {
        const lines = fileContent.substr(0, charIndex).split('\n');
        return lines.length;
    }
}

export class ParsedExtract {
    lineNumber: number;
    regExType: RegexType;
    matches: string[];

    constructor(lineNumber: number, regExType: RegexType, matches: string[]) {
        this.lineNumber = lineNumber;
        this.regExType = regExType;
        this.matches = matches;
    }

    toString() {
        return `linenumber: ${this.lineNumber}, matches: ${this.matches}`
    }

    getName() {
        if (this.regExType.hasLabels == false) {
            return this.regExType.type.toLowerCase();
        } else {
            const labelIndex = this.regExType.regExGroups.indexOf('label');
            return this.matches[labelIndex];
        }
    }

    getTitle(): string | null {
        const titleIndex = this.regExType.regExGroups.indexOf('title');
        return this.matches[titleIndex];
    }

    static normalizeString(str:string): string {
        if (!str) {
            return str;
        }
        // Nur strings länger als 1 normalisieren
        if (str.length == 1) {
            return str;
        }
        return str.replace(/^[^a-zA-Z0-9[#]+|[^a-zA-Z0-9\]]+$/g, '').toLowerCase();
      }

    // Gibt den String der RegexGruppe zurück.
    getMatchByGroupname(groupname:string) {
        return this.matches[this.regExType.regExGroups.indexOf(groupname)];
    }

    // Check, ob eine RegeGrupp für den gewählten Gruppennamen existiert.
    checkIfGroupnameExists(groupname:string) {
        return this.regExType.regExGroups.includes(groupname);
    }
}