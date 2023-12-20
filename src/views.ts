import { WorkspaceLeaf, ItemView, Menu, getIcon, Notice, setIcon } from "obsidian";

import RegexExtractorPlugin from "./main";
import { VIEW_TYPE } from "./main";
//import { t } from "./lang/helper"

export class RegexExtractorView extends ItemView {
	private plugin: RegexExtractorPlugin;
	private eventListeners: Array<{ element: HTMLElement; handler: (event: MouseEvent) => void }> = [];

	constructor(leaf: WorkspaceLeaf, plugin: RegexExtractorPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

    getViewType(): string {
        return VIEW_TYPE;
    }

    getDisplayText(): string {
        return 'Displays Regex Extracts';
    }

    protected async onOpen(): Promise<void> {
        this.drawTestContent(this.contentEl); // Wenn man hier containerEl nimmt anstatt contentEl, ist es auf gleicher Höhe mit den anderen und verschwindet.
    }

    protected async drawTestContent(viewContent: Element) {
        const testDiv = createDiv('testDiv');
        testDiv.innerHTML = 'HALLO WELT.';
        viewContent.appendChild(testDiv);
    }

}