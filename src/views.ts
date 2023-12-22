import { WorkspaceLeaf, ItemView, setIcon } from "obsidian";
import RegexExtractorPlugin from "./main";
import { Parser } from "./parser";
import { REGEX_TYPES, VIEW_TYPES, getFilterableRegexTypes, getRegexTypeNames } from './constants';
import { types } from "util";

//import { t } from "./lang/helper"

export class RegexExtractorView extends ItemView {
	private plugin: RegexExtractorPlugin;
	private eventListeners: Array<{ element: HTMLElement; handler: (event: MouseEvent) => void }> = [];

	constructor(leaf: WorkspaceLeaf, plugin: RegexExtractorPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

    getViewType(): string {
        return VIEW_TYPES.DEFAULT_VIEW;
    }

    getDisplayText(): string {
        return 'Displays Regex Extracts';
    }

    // Wird verwendet beim Öffnen der View
    protected async onOpen(): Promise<void> {
        // Load Basic View Elements (Buttons, Divs)
        this.loadViewStructure(this.contentEl);
        // Load Specific View Element
        this.reloadRegexExtractorView();
    }

    reloadRegexExtractorView() {
        const typesContainer = document.getElementById('typesContainer')
        const fieldsContainer = document.getElementById('parsedFieldsContainer');
        const contentContainer = document.getElementById('parsedContentContainer');
        if (typesContainer) {
            this.drawTypes(typesContainer);
        }
        if (fieldsContainer) {
            this.drawFields(fieldsContainer); 
        }
        if (contentContainer) {
            this.drawParsedContentTable(contentContainer);
        }
    }

    onload(): void {
    }

    protected loadViewStructure(viewContent: Element) {
        // add icon for refresh
		const navActionButtonRefresh = viewContent.createEl("div", "nav-action-button");
		setIcon(navActionButtonRefresh, "refresh-cw");

		navActionButtonRefresh.addEventListener("click", (event: MouseEvent) => {
            const parsedFieldsContainer = document.getElementById('parsedFieldsContainer');
            if (parsedFieldsContainer) {
                this.drawFields(parsedFieldsContainer);
            }
		});

        // Aktuell ausgeblendet
        // const typesContainer = document.createElement('div');
        // typesContainer.id = 'typesContainer'
        // typesContainer.classList.add('typesContainer');
        // viewContent.appendChild(typesContainer);

        const parsedFieldsContainer = document.createElement('div');
        parsedFieldsContainer.id = 'parsedFieldsContainer'
        parsedFieldsContainer.classList.add('parsedFieldsContainer');
        viewContent.appendChild(parsedFieldsContainer);

        const parsedContentContainer = document.createElement('div')
        parsedContentContainer.id = 'parsedContentContainer'
        parsedContentContainer.classList.add('parsedContentContainer');
        viewContent.appendChild(parsedContentContainer);
    }

    protected drawTypes(parentElement: Element) {
        parentElement.innerHTML = '';
        const types = getRegexTypeNames();
        types.forEach(type => {
            const typePill = this.makePill(type);
            parentElement.appendChild(typePill);
        })
    }

    protected async drawFields(parentElement: Element) {
        parentElement.innerHTML = '';

        const regexTypes = getFilterableRegexTypes();

        regexTypes.forEach(async (type) => {
            const parser = new Parser(this.plugin);
            const fieldsMatches = await parser.parseFields(type);
            const distinctFieldnames = parser.getDistinctFieldNames(fieldsMatches);
    
            distinctFieldnames.forEach((fieldname: string) => {
                const fieldPill = this.makePill(fieldname);
                parentElement.appendChild(fieldPill);
            })
        })

    }

    protected async drawParsedContentTable(parentElement: Element, filter?: string) {
        parentElement.innerHTML = '';

        const regexTypes = Object.values(REGEX_TYPES);

        regexTypes.forEach(async (type) => {
            const parser = new Parser(this.plugin);
            const fieldsMatches = await parser.parseFields(type);
            const parsedContentTable = document.createElement("table");
            fieldsMatches.forEach((fieldmatch) => {
                const tableRow = fieldmatch.toTableLine(filter)
                if (tableRow) {
                    parsedContentTable.appendChild(tableRow);
                }})
            parentElement.appendChild(parsedContentTable);
        });
    }

    makePill(fieldname: string): Element {
        const fieldElement = createEl("div", "fieldElement");
        fieldElement.setAttribute("fieldname", fieldname);
        fieldElement.innerHTML = fieldname;

        fieldElement.addEventListener('click', () => {
            const contentContainer = document.getElementById('parsedContentContainer');
            if (contentContainer) {
                this.drawParsedContentTable(contentContainer, fieldname);
            }
        })

        return fieldElement;
    }

}