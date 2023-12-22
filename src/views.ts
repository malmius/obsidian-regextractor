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
        this.drawDataviewFields(this.contentEl); 
        this.drawParsedContentTable(this.contentEl);
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

    protected async drawFields(viewContent: Element) {
        const fieldsParser = new FieldsParser(this.plugin);
        const fieldsMatches = await fieldsParser.parseFields();
        fieldsMatches.forEach((fieldmatch) => console.log(fieldmatch.toTableLine()));
        console.log(fieldsMatches);

        const fieldsDiv = createDiv('fieldsDiv');
        fieldsDiv.innerHTML = fieldsMatches.join(',');
        viewContent.appendChild(fieldsDiv);
    }

    protected async drawParsedContentTable(viewContent: Element) {
        const fieldsParser = new FieldsParser(this.plugin);
        const fieldsMatches = await fieldsParser.parseFields();
        const parsedContentContainer = document.createElement("div")
        parsedContentContainer.classList.add("parsedContentContainer");
        const parsedContentTable = document.createElement("table");
        fieldsMatches.forEach((fieldmatch) => parsedContentTable.appendChild(fieldmatch.toTableLine()));

        parsedContentContainer.appendChild(parsedContentTable);
        viewContent.appendChild(parsedContentContainer);
    }



    protected async drawDataviewFields(viewContent: Element) {
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
            })

            viewContent.appendChild(fieldElement);
        }
    }

}