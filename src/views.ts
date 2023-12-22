import { WorkspaceLeaf, ItemView, Editor } from "obsidian";
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

    protected async onOpen(): Promise<void> {
        this.loadViewStructure(this.contentEl);
        const fieldsContainer = document.getElementById('parsedFieldsContainer');
        const contentContainer = document.getElementById('parsedContentContainer');
        if (fieldsContainer) {
            this.drawDataviewFields(fieldsContainer); 
        }
        if (contentContainer) {
            this.drawParsedContentTable(contentContainer);
        }
        // this.drawDataviewContent(this.contentEl);
    }

    // Beispiel Menü-Item
    // public onPaneMenu(menu: Menu): void {
	// 	menu.addItem((item) => {
	// 		item.setTitle("CLOSE")
	// 			.setIcon("cross")
	// 			.onClick(() => {
	// 				this.app.workspace.detachLeavesOfType(VIEW_TYPES.DEFAULT_VIEW);
	// 			});
	// 	});
	// }

    onload(): void {
    }

    protected loadViewStructure(viewContent: Element) {
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
        const fieldsParser = new FieldsParser(this.plugin);
        const fieldsMatches = await fieldsParser.parseFields();
        fieldsMatches.forEach((fieldmatch) => console.log(fieldmatch.toTableLine()));
        console.log(fieldsMatches);

        const fieldsDiv = createDiv('fieldsDiv');
        fieldsDiv.innerHTML = fieldsMatches.join(',');
        parentElement.appendChild(fieldsDiv);
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

    protected async drawDataviewFields(parentElement: Element) {
        const dataviewParser = new DataviewParser(this.plugin);
        const dataViewFieldsArray = dataviewParser.returnDataviewFieldNames();

        for (const fieldName of dataViewFieldsArray) {
            const fieldElement = createEl("div", "fieldElement");
            fieldElement.setAttribute("fieldname", fieldName);
            // const fieldLink = createEl("a", "fieldLink");
            fieldElement.innerHTML = fieldName;
            // fieldElement.appendChild(fieldLink);

            fieldElement.addEventListener('click', () => {
                console.log("fieldName clicked");
                const contentContainer = document.getElementById('parsedContentContainer');
                if (contentContainer) {
                    this.drawParsedContentTable(contentContainer, fieldName);
                }
            })

            parentElement.appendChild(fieldElement);
        }
    }

}