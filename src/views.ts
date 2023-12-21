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
        this.drawDataviewContent(this.contentEl);
        this.drawTestContent(this.contentEl); // Wenn man hier containerEl nimmt anstatt contentEl, ist es auf gleicher Höhe mit den anderen und verschwindet.
        console.log(this.getLineInEditor(0));
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

    getLineInEditor(linenumber: number): string {
        // Der Editor existiert nur, wenn der Fokus auf dem Editor / VIew ist und nicht, wenn der Fokus z.B. auf der Seitenleiste ist.
        const editor = app.workspace.activeEditor?.editor;
        console.log('editor:');
        console.log(editor);
        if (editor) {
            console.log('get line from editor:')
            return editor.getLine(linenumber);
        }
        return 'no line';
    }


    async goToLine(editor: Editor, operations: EditorSelectionOrCaret[]) {
            const lastLine = editor.lastLine();
            const pastEnd = operations.find(op => op.anchor.line > lastLine)
            if (pastEnd != undefined) {
                const lastChar = editor.getLine(lastLine).length
                editor.setSelection({line: lastLine, ch: lastChar});
                editor.exec("newlineAndIndent");
            }
        editor.setSelections(operations);
    }

}