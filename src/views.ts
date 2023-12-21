import { WorkspaceLeaf, ItemView, Menu, getIcon, Notice, setIcon } from "obsidian";
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
        this.drawDataviewContent(this.contentEl);
        this.drawTestContent(this.contentEl); // Wenn man hier containerEl nimmt anstatt contentEl, ist es auf gleicher Höhe mit den anderen und verschwindet.
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

    protected async drawTestContent(viewContent: Element) {
        const testDiv = createDiv('testDiv');
        testDiv.innerHTML = 'HALLO WELT.';
        viewContent.appendChild(testDiv);

        const dataviewParser = new DataviewParser(this.plugin);
        dataviewParser.returnDataviewFieldNames();
    }

    protected async drawDataviewContent(viewContent: Element) {
        const dataviewParser = new DataviewParser(this.plugin);
        const dataViewFieldsArray = dataviewParser.returnDataviewFieldNames();
        let htmlLinks = '';
        for (let i = 0; i < dataViewFieldsArray.length; i++) {
            htmlLinks += '<a href="' + dataViewFieldsArray[i] + '">' + dataViewFieldsArray[i] + '</a><br>';
        }

        const testDiv = createDiv('dataviewfields');
        testDiv.innerHTML = htmlLinks;
        viewContent.appendChild(testDiv);


        const fieldsParser = new FieldsParser(this.plugin);
        const fieldsMatches = await fieldsParser.parseFields();
        console.log(fieldsMatches);

        const fieldsDiv = createDiv('fieldsDiv');
        fieldsDiv.innerHTML = fieldsMatches.join(',');
        viewContent.appendChild(fieldsDiv);
    }

}