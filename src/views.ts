import { WorkspaceLeaf, ItemView, setIcon, MarkdownRenderer } from "obsidian";
import RegexExtractorPlugin from "./main";
import { Parser, ParsedExtract } from "./parser";
import { REGEX_TYPES, VIEW_TYPES, getFilterableRegexTypes, getRegexTypeNames } from './constants';

enum LAYOUT_TYPE {'TABLE', 'CARD'}

//import { t } from "./lang/helper"

export class RegexExtractorView extends ItemView {
	private plugin: RegexExtractorPlugin;
	private eventListeners: Array<{ element: HTMLElement; handler: (event: MouseEvent) => void }> = [];
    private currentLayout: LAYOUT_TYPE = LAYOUT_TYPE.TABLE;

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
        this.reloadRegexExtractorViewDefault();
    }

    reloadRegexExtractorViewDefault() {
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
            this.drawContent(contentContainer, this.currentLayout);
            // this.drawParsedContentTable(contentContainer);
            // this.drawParsedContentCard(contentContainer);
        }
    }

    onload(): void {
    }

    protected loadViewStructure(viewContent: Element) {
        // add icon for refresh
		const navActionButtonRefresh = viewContent.createEl("div", "nav-action-button");
		setIcon(navActionButtonRefresh, "refresh-cw");
		const navActionButtonShowAsCard = viewContent.createEl("div", "nav-action-button");
		setIcon(navActionButtonShowAsCard, "panel-top");
        const navActionButtonShowAsTable = viewContent.createEl("div", "nav-action-button");
		setIcon(navActionButtonShowAsTable, "table");
        const fieldTypeDropDown = viewContent.createEl("select", "fieldTypeDropDown");

		navActionButtonRefresh.addEventListener("click", (event: MouseEvent) => {
            this.reloadRegexExtractorViewDefault();
		});

        navActionButtonShowAsCard.addEventListener("click", (event: MouseEvent) => {
            this.currentLayout = LAYOUT_TYPE.CARD;
            const parsedContentContainer = document.getElementById('parsedContentContainer');
            if (parsedContentContainer) {
                this.drawContent(parsedContentContainer, this.currentLayout);
            }
		});

        navActionButtonShowAsTable.addEventListener("click", (event: MouseEvent) => {
            this.currentLayout = LAYOUT_TYPE.TABLE;
            const parsedContentContainer = document.getElementById('parsedContentContainer');
            if (parsedContentContainer) {
                this.drawContent(parsedContentContainer, this.currentLayout);
            }
		});

        // Field Types
        const regexTypeNames: string[] = getRegexTypeNames();
        regexTypeNames.forEach((regexTypeName) => {
            const fieldTypeOption = fieldTypeDropDown.createEl("option");
            fieldTypeOption.value = regexTypeName;
            fieldTypeOption.text = regexTypeName;
        })

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

    protected async drawContent(parentElement: Element, layoutType: LAYOUT_TYPE, filter?: string) {
        switch (layoutType) {
            case LAYOUT_TYPE.CARD:
                this.drawParsedContentCard(parentElement, filter);
                break;
            case LAYOUT_TYPE.TABLE:
                this.drawParsedContentTable(parentElement, filter)
                break;
            default:
                break;
        }
    }

    protected async drawParsedContentTable(parentElement: Element, filter?: string) {
        parentElement.innerHTML = '';

        const regexTypes = Object.values(REGEX_TYPES);

        regexTypes.forEach(async (type) => {
            const parser = new Parser(this.plugin);
            const fieldsMatches = await parser.parseFields(type);
            const parsedContentTable = document.createElement("table");
            fieldsMatches.forEach((fieldmatch) => {
                const tableRow = this.extractToTableLine(fieldmatch, filter)
                if (tableRow) {
                    parsedContentTable.appendChild(tableRow);
                }})
            parentElement.appendChild(parsedContentTable);
        });
    }

    protected async drawParsedContentCard(parentElement: Element, filter?: string) {
        parentElement.innerHTML = '';
        const regexTypes = Object.values(REGEX_TYPES);

        regexTypes.forEach(async (type) => {
            const parser = new Parser(this.plugin);
            const fieldsMatches = await parser.parseFields(type);
            fieldsMatches.forEach((fieldmatch) => {
                const card = this.extractToCard(fieldmatch, filter);
                if (card) {
                    parentElement.appendChild(card);
                }})
        });
    }

    makePill(fieldname: string): Element {
        const fieldElement = createEl("div", "fieldElement");
        fieldElement.setAttribute("fieldname", fieldname);
        fieldElement.innerHTML = fieldname;

        fieldElement.addEventListener('click', () => {
            const contentContainer = document.getElementById('parsedContentContainer');
            if (contentContainer) {
                this.drawContent(contentContainer, this.currentLayout, fieldname);
            }
        })

        return fieldElement;
    }

    extractToCard(extract: ParsedExtract, filter?: string): Element | null {
        if (filter) {
            const filterLowerCase = filter.toLowerCase();
            if (!getRegexTypeNames().includes(filterLowerCase)) {
                if (!extract.matches[extract.regExType.titleGroupIndex]?.toLowerCase().includes(filterLowerCase)) {
                    return null;
                }
            }
        }
        
        const regExtractorCard = document.createElement("div");
        regExtractorCard.classList.add('regExtractorCard');
        const contentString = extract.matches[extract.regExType.contentGroupIndex];
        regExtractorCard.innerHTML = contentString;
        return regExtractorCard;
    }

    extractToTableLine(extract: ParsedExtract, filter?: string): Element | null {
        // console.log('tablefilter: ' + filter);
        if (filter) {
            const filterLowerCase = filter.toLowerCase();
            if (!getRegexTypeNames().includes(filterLowerCase)) {
                if (!extract.matches[extract.regExType.titleGroupIndex]?.toLowerCase().includes(filterLowerCase)) {
                    return null;
                }
            }
        }
        const tableRow = document.createElement("tr");

        // linenumber
        const columnLineNumber = document.createElement("td");
        columnLineNumber.innerHTML = extract.lineNumber.toString();
        tableRow.appendChild(columnLineNumber);

        // parsedelement
        const columnParsedContent = document.createElement("td");
        const contentString = extract.matches[extract.regExType.contentGroupIndex];

        // columnParsedContent.createSpan("extractor-element-text"), (el: HTMLElement) => {MarkdownRenderer.render(this.plugin.app, contentString, el, this.plugin.app.workspace.getActiveViewOfType(VIEW_TYPES.DEFAULT_VIEW), this.plugin)};
        columnParsedContent.innerHTML = contentString;
        tableRow.appendChild(columnParsedContent);
        return tableRow;
    }

}