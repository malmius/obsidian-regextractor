import { WorkspaceLeaf, ItemView, Editor, setIcon } from "obsidian";
import RegexExtractorPlugin from "./main";
import { DataviewParser, FieldsParser } from "./parser";
import { VIEW_TYPES } from './constants';

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
        const fieldsContainer = document.getElementById('parsedFieldsContainer');
        const contentContainer = document.getElementById('parsedContentContainer');
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

        const parsedFieldsContainer = document.createElement('div');
        parsedFieldsContainer.id = 'parsedFieldsContainer'
        parsedFieldsContainer.classList.add('parsedFieldsContainer');
        viewContent.appendChild(parsedFieldsContainer);

        const parsedContentContainer = document.createElement('div')
        parsedContentContainer.id = 'parsedContentContainer'
        parsedContentContainer.classList.add('parsedContentContainer');
        viewContent.appendChild(parsedContentContainer);
    }

    protected async drawFields(parentElement: Element) {
        parentElement.innerHTML = '';

        const fieldsParser = new FieldsParser(this.plugin);
        const fieldsMatches = await fieldsParser.parseFields();
        const distinctFieldnames = fieldsParser.getDistinctFieldNames(fieldsMatches);

        distinctFieldnames.forEach((fieldname) => {
            const fieldPill = this.drawFieldnameAsPill(fieldname);
            parentElement.appendChild(fieldPill);
        })

    }

    protected async drawParsedContentTable(parentElement: Element, filter?: string) {
        parentElement.innerHTML = '';
        const fieldsParser = new FieldsParser(this.plugin);
        const fieldsMatches = await fieldsParser.parseFields();
        const parsedContentTable = document.createElement("table");
        fieldsMatches.forEach((fieldmatch) => {
            const tableRow = fieldmatch.toTableLine(filter)
            if (tableRow) {
                parsedContentTable.appendChild(tableRow);
            }})
        parentElement.appendChild(parsedContentTable);
    }

    drawFieldnameAsPill(fieldname: string): Element {
        const fieldElement = createEl("div", "fieldElement");
        fieldElement.setAttribute("fieldname", fieldname);
        fieldElement.innerHTML = fieldname;

        fieldElement.addEventListener('click', () => {
            console.log("fieldName clicked");
            const contentContainer = document.getElementById('parsedContentContainer');
            if (contentContainer) {
                this.drawParsedContentTable(contentContainer, fieldname);
            }
        })

        return fieldElement;
    }

}