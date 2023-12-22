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

    protected async onOpen(): Promise<void> {
        this.loadViewStructure(this.contentEl);
        const fieldsContainer = document.getElementById('parsedFieldsContainer');
        const contentContainer = document.getElementById('parsedContentContainer');
        if (fieldsContainer) {
            this.drawFields(fieldsContainer); 
        }
        if (contentContainer) {
            this.drawParsedContentTable(contentContainer);
        }
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
        // add icon for refresh
		const navActionButtonRefresh = document.createElement("nav-action-button");
		setIcon(navActionButtonRefresh, "refresh-cw");

		navActionButtonRefresh.addEventListener("click", (event: MouseEvent) => {
            const parsedFieldsContainer = document.getElementById('parsedFieldsContainer');
            if (parsedFieldsContainer) {
                this.drawFields(parsedFieldsContainer);
            }
		});
        viewContent.appendChild(navActionButtonRefresh);

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

        // fieldsMatches.forEach((fieldsmatch) => {
        //     const fieldname = fieldsmatch.matches[fieldsmatch.regExType.titleGroupIndex];
        //     const fieldPill = this.drawFieldnameAsPill(fieldname);
        //     parentElement.appendChild(fieldPill);
        // })

        distinctFieldnames.forEach((fieldname) => {
            const fieldPill = this.drawFieldnameAsPill(fieldname);
            parentElement.appendChild(fieldPill);
        })

        // const fieldsDiv = createDiv('fieldsDiv');
        // fieldsDiv.innerHTML = fieldsMatches.join(',');
        // parentElement.appendChild(fieldsDiv);
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

    // protected async drawDataviewFields(parentElement: Element) {
    //     parentElement.innerHTML = '';

    //     const dataviewParser = new DataviewParser(this.plugin);
    //     const dataViewFieldsArray = dataviewParser.returnDataviewFieldNames();

    //     for (const fieldName of dataViewFieldsArray) {
    //         const fieldElement = createEl("div", "fieldElement");
    //         fieldElement.setAttribute("fieldname", fieldName);
    //         // const fieldLink = createEl("a", "fieldLink");
    //         fieldElement.innerHTML = fieldName;
    //         // fieldElement.appendChild(fieldLink);

    //         fieldElement.addEventListener('click', () => {
    //             console.log("fieldName clicked");
    //             const contentContainer = document.getElementById('parsedContentContainer');
    //             if (contentContainer) {
    //                 this.drawParsedContentTable(contentContainer, fieldName);
    //             }
    //         })

    //         parentElement.appendChild(fieldElement);
    //     }
    // }

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