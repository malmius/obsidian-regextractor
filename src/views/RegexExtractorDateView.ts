import { WorkspaceLeaf, ItemView, setIcon, MarkdownRenderer, TFile, Notice } from "obsidian";
import RegexExtractorPlugin from "../main";
import { Parser, ParsedExtract } from "../parser";
import { REGEX_TYPES, REGEXTRACT_RENDER_TYPE, VIEW_TYPES, getRegexTypesWithLabels, getRegexTypeNames, REGEXTRACT_TYPE, getHasLabelsFromDisplayName, getTypeFromDisplayName } from '../constants';
import { getArrayFromText } from "../settings";
import { LAYOUT_TYPE, DEFAULT_REGEXTRACT_DROPDOWN } from "../constants";

//import { t } from "./lang/helper"

export class RegextractorDateView extends ItemView {
	private plugin: RegexExtractorPlugin;
	private eventListeners: Array<{ element: HTMLElement; handler: (event: MouseEvent) => void }> = [];
    private currentLayout: LAYOUT_TYPE = LAYOUT_TYPE.CARD;

	constructor(leaf: WorkspaceLeaf, plugin: RegexExtractorPlugin) {
		super(leaf);
		this.plugin = plugin;
        this.icon = 'scroll';
	}

    getViewType(): string {
        return VIEW_TYPES.DEFAULT_VIEW_GLOBAL;
    }

    getDisplayText(): string {
        return 'Global Regex Extracts';
    }

    // Wird verwendet beim Öffnen der View
    protected async onOpen(): Promise<void> {

        // Load Basic View Elements (Buttons, Divs)
        this.loadViewStructure(this.contentEl);
        // Load Specific View Element
        this.refreshView();
    }

    loadViewStructure(parentElement: Element) {
        const container = parentElement.createEl("div", "regextractor-year-container")
        container.id = 'regextractor-year-container'
    }

    async refreshView() {
        this.parseYearInstances();
        const matches = await this.parseYearInstances();
        const container = document.getElementById('regextractor-year-container');
        console.log(Object.keys(matches));

        for (const key of Object.keys(matches)) {
            if (container) {
                console.log('container is element')
                const header = container.createEl("h4");
                header.textContent = key;
                const year = container.createEl("p")
                year.textContent = matches[key];
            }
        }

    }

    async parseYearInstances() {
        const allFiles = this.plugin.app.vault.getFiles();
        const matches = {};

        for (let i = 0; i < 5; i++) {
            const cachedRead = await this.plugin.app.vault.cachedRead(allFiles[i])
            const matcharray = this.returnFieldMatchesByLine(cachedRead.split('\n'));
            if (matcharray.length > 0) {
                matches[allFiles[i].name] = matcharray;
            }
        }
        return matches;

        // allFiles.forEach(file => {
        //     const fileCache = this.plugin.app.metadataCache.getFileCache(file);
        //     console.log()
        // })
    }

    returnFieldMatchesByLine(lines: string[]): string[] {
        const regExpression = new RegExp('(?<!_)\\b\\d{4}\\b', "gm");
        const extracts: string[] = [];
        
        for (let i = 0; i < lines.length; i++) { // Read filecontent line by line
            const line = lines[i]; // current line
            const matches = line.matchAll(regExpression);
            if (matches) {
                for (const match of matches) {
                    // console.log("match: " + match);
                    extracts.push(match[0]);
                }
            }
        }
        return extracts;
    }


}