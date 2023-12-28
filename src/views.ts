import { WorkspaceLeaf, ItemView, setIcon, MarkdownRenderer, TFile } from "obsidian";
import RegexExtractorPlugin from "./main";
import { Parser, ParsedExtract } from "./parser";
import { REGEX_TYPES, REGEXTRACT_RENDER_TYPE, VIEW_TYPES, getRegexTypesWithLabels, getRegexTypeNames, REGEXTRACT_TYPE, getHasLabelsFromDisplayName, getTypeFromDisplayName } from './constants';

enum LAYOUT_TYPE {'TABLE', 'CARD'}

//import { t } from "./lang/helper"

export class RegexExtractorView extends ItemView {
	private plugin: RegexExtractorPlugin;
	private eventListeners: Array<{ element: HTMLElement; handler: (event: MouseEvent) => void }> = [];
    private currentLayout: LAYOUT_TYPE = LAYOUT_TYPE.CARD;

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

        // console.log(this.getViewType());

        // Load Basic View Elements (Buttons, Divs)
        this.loadViewStructure(this.contentEl);
        // Load Specific View Element
        this.reloadRegexExtractorViewDefault();
    }

    reloadRegexExtractorViewDefault() {
        // Set Defaults
        const fieldTypeDropDown = document.getElementById("regextractor-nav-select-regextype");
        if (fieldTypeDropDown instanceof HTMLSelectElement) {
            fieldTypeDropDown.value = 'all';
        }

        const fieldsContainer = document.getElementById('regextractor-container-labels');
        const contentContainer = document.getElementById('regextractor-container-extracts');
        if (fieldsContainer) {
            this.drawFields(fieldsContainer, fieldTypeDropDown.value); 
        }
        if (contentContainer) {
            this.drawContent(contentContainer, this.currentLayout);
        }

        // Keine ausgewählten Pills
        const fieldElement = document.querySelectorAll('.fieldElement');
        fieldElement.forEach(element => {
            element.removeClass('selectedPill');
        });

        this.refreshParsedExtracts();
    }

    onload(): void {
    }

    protected loadViewStructure(viewContent: Element) {
        // Add Container
        const navigationContainer = viewContent.createEl("div", "regextractor-container-nav");

        const fieldsContainer = viewContent.createEl("div", "regextractor-container-labels");
        fieldsContainer.id = 'regextractor-container-labels'

        const contentContainer = viewContent.createEl('div', "regextractor-container-extracts")
        contentContainer.id = 'regextractor-container-extracts'

        // add icon for refresh
		const navActionButtonRefresh = navigationContainer.createEl("div", "regextractor-nav-action-button");
		setIcon(navActionButtonRefresh, "refresh-cw");
		const navActionButtonShowAsCard = navigationContainer.createEl("div", "regextractor-nav-action-button");
		setIcon(navActionButtonShowAsCard, "panel-top");
        const navActionButtonShowAsTable = navigationContainer.createEl("div", "regextractor-nav-action-button");
		setIcon(navActionButtonShowAsTable, "table");
        const regexTypeSelect = navigationContainer.createEl("select", "regextractor-nav-dropdown");
        regexTypeSelect.id = "regextractor-nav-select-regextype";

		navActionButtonRefresh.addEventListener("click", (event: MouseEvent) => {
            this.reloadRegexExtractorViewDefault();
		});

        navActionButtonShowAsCard.addEventListener("click", (event: MouseEvent) => {
            this.currentLayout = LAYOUT_TYPE.CARD;
            const containerExtracts = document.getElementById('regextractor-container-extracts');
            if (containerExtracts) {
                this.drawContent(containerExtracts, this.currentLayout);
            }
		});

        navActionButtonShowAsTable.addEventListener("click", (event: MouseEvent) => {
            this.currentLayout = LAYOUT_TYPE.TABLE;
            const containerExtracts = document.getElementById('regextractor-container-extracts');
            if (containerExtracts) {
                this.drawContent(containerExtracts, this.currentLayout);
            }
		});

        // Field Types
        const regexTypeNames: string[] = getRegexTypeNames();
        const fieldTypeOption = regexTypeSelect.createEl("option");
        fieldTypeOption.value = 'all';
        fieldTypeOption.text = 'all';
        fieldTypeOption.setAttribute("selected", "selected");
        regexTypeNames.forEach((regexTypeName) => {
            const fieldTypeOption = regexTypeSelect.createEl("option");
            fieldTypeOption.value = regexTypeName;
            fieldTypeOption.text = regexTypeName;
        })

        regexTypeSelect.addEventListener('change', () => {
            this.refreshParsedExtracts();
        });
    }

    protected refreshParsedExtracts() {
        const fieldsContainer = document.getElementById('regextractor-container-labels');
        const fieldTypeDropDown = document.getElementById('regextractor-nav-select-regextype');
        if (fieldsContainer instanceof HTMLElement && fieldTypeDropDown instanceof HTMLSelectElement) {
            const fieldTypeDropDownValue = fieldTypeDropDown?.value;
            const regextractTypeHasLabel = getHasLabelsFromDisplayName(fieldTypeDropDownValue);
            if (regextractTypeHasLabel) {
                fieldsContainer?.setAttribute("ishidden", "false");
                fieldsContainer.style.display = 'block';
                this.drawFields(fieldsContainer, fieldTypeDropDownValue);
            } else {
                fieldsContainer?.setAttribute("ishidden", "true");
                fieldsContainer.style.display = 'none';
            }
            const type = getTypeFromDisplayName(fieldTypeDropDownValue)
            this.filterCardsByType(getTypeFromDisplayName(fieldTypeDropDownValue));
            this.filterCardsByLabel();
        }
    }


    protected filterCardsByType(selectedType:string) {
        const elements = document.querySelectorAll('.regExtractorCard');
        elements.forEach(function(element) {
            if (element instanceof HTMLElement) {
                // 'all' ist ausgewählt
                if (selectedType == 'all') {
                    element.setAttribute("isfiltered", "false");
                    element.style.display = 'grid';
                    return;
                }
                if (element.getAttribute('regextype') === selectedType) {
                    element.setAttribute("isfiltered", "false");
                    element.style.display = 'grid';
                } else {
                    element.setAttribute("isfiltered", "true");
                    element.style.display = 'none';
                }
            }
        })
    }

    protected filterCardsByLabel() {
        if (document.getElementById('regextractor-container-labels')?.getAttribute("ishidden") == "true") {
            return;
        }
        const selectedPillsElements = document.querySelectorAll('.fieldElement.selectedPill');
        const selectedFieldNames = Array.from(selectedPillsElements).map(element => element.getAttribute("fieldname"));
        const elements = document.querySelectorAll('.regExtractorCard[isfiltered="false"]');
        elements.forEach(function(element) {
            if (element instanceof HTMLElement) {
                if (selectedFieldNames.length == 0 || selectedFieldNames.includes(element.getAttribute("extractlabel"))) {
                    element.style.display = 'grid';
                } else {
                    element.style.display = 'none';
                }
            }
        })
    }

    protected async drawFields(parentElement: Element, fieldTypeDropDownValue: string) {
        parentElement.innerHTML = '';

        const regexTypes = getRegexTypesWithLabels();

        regexTypes.forEach(async (type) => {
            const parser = new Parser(this.plugin);
            const fieldsMatches = await parser.parseFields(type);
            const distinctFieldnames = await parser.getDistinctFieldNames(fieldsMatches);
            // let distinctFieldnamesAfterSettings = distinctFieldnames;

            try {
                const settingsIgnoreFields = this.plugin.settings.ignoreFieldsList.split(',');
                for (const key of Object.keys(distinctFieldnames)) {
                    distinctFieldnames[key].filter(fieldName => !settingsIgnoreFields.includes(fieldName));
                }
                // distinctFieldnamesAfterSettings = distinctFieldnames.filter(fieldName => !settingsIgnoreFields.includes(fieldName));
            } catch (error) {
                console.log('cant split settings string.');
            } finally {
                for (const key of Object.keys(distinctFieldnames)) {
                    console.log(key)
                    console.log(fieldTypeDropDownValue)
                    console.log(getTypeFromDisplayName(fieldTypeDropDownValue))
                    if (key === getTypeFromDisplayName(fieldTypeDropDownValue)) {
                        distinctFieldnames[key].forEach((fieldname: string) => {
                            const fieldPill = this.makePill(fieldname);
                            parentElement.appendChild(fieldPill);
                        })
                    }
                }
            }
        })

    }

    protected async drawContent(parentElement: Element, layoutType: LAYOUT_TYPE) {
        switch (layoutType) {
            case LAYOUT_TYPE.CARD:
                this.drawParsedContentCard(parentElement);
                break;
            case LAYOUT_TYPE.TABLE:
                this.drawParsedContentTable(parentElement);
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

    protected async drawParsedContentCard(parentElement: Element) {
        parentElement.innerHTML = '';
        const regexTypes = Object.values(REGEX_TYPES);

        regexTypes.forEach(async (type) => {
            const parser = new Parser(this.plugin);
            const fieldsMatches = await parser.parseFields(type);
                fieldsMatches.forEach((fieldmatch) => {
                    let card: Element | null;
                    if (type.renderType == REGEXTRACT_RENDER_TYPE.FRONT_BACK) {
                        card = this.extractToFrontBackCard(fieldmatch);
                        card?.setAttribute("regextype", type.type);
                    }
                    else if (type.renderType == REGEXTRACT_RENDER_TYPE.REGULAR) {
                        card = this.extractToRegularCard(fieldmatch);
                        card?.setAttribute("regextype", type.type);
                    }
                    else {
                        card = null;
                    }
                    if (card) {
                        parentElement.appendChild(card);
                    }
                })
            })
        }

    makePill(fieldname: string): Element {
        const fieldElement = createEl("div", "fieldElement");
        fieldElement.setAttribute("fieldname", fieldname);
        fieldElement.innerHTML = fieldname;

        fieldElement.addEventListener('click', () => {
            fieldElement.classList.toggle('selectedPill');
            this.filterCardsByLabel();
        })

        return fieldElement;
    }


    extractToRegularCard(extract: ParsedExtract): Element | null {
        const regExtractorCard = document.createElement("div");
        regExtractorCard.addClass('regExtractorCard');
        regExtractorCard.setAttribute("cardType", "regular");
        regExtractorCard.setAttribute("isShortened", "false");
        regExtractorCard.setAttribute("extractlabel", ParsedExtract.normalizeString(extract.getName()));
        

        const extractTypeName = ParsedExtract.normalizeString(extract.getName());
        const contentString = extract.matches[extract.regExType.contentGroupIndex];
        const contentIsLong: boolean = contentString.length >= 200;

        const regExtractorCardLabelArea = regExtractorCard.createEl("div", "regExtractorCardLabelArea");
        regExtractorCardLabelArea.addClass("regExtractorCardLabelArea");
        regExtractorCardLabelArea.textContent = extractTypeName;

        const cardMarkdownText = regExtractorCard.createEl("div", "cardMarkdownText");
        cardMarkdownText.addClass("cardMarkdownText");

        if (contentIsLong) {
            const truncatedContentString = contentString.substring(0, 180) + "...";

            regExtractorCard.setAttribute("isShortened", "true");
            cardMarkdownText.createDiv(("markdown-text"), (el: HTMLElement) => {
                MarkdownRenderer.render(this.plugin.app
                    , truncatedContentString
                    , el
                    , this.plugin.app.workspace.getActiveFile()?.path || ""
                    , this.plugin
                    )});

            // Toggle between shortened and long version
            regExtractorCard.addEventListener("click", (event: MouseEvent) => {
                this.toggleShortLong(regExtractorCard, contentString, truncatedContentString);
            }); 
        } else {
            cardMarkdownText.createDiv(("markdown-text"), (el: HTMLElement) => {MarkdownRenderer.render(this.plugin.app, contentString, el, this.plugin.app.workspace.getActiveFile()?.path || "", this.plugin)});
            // regExtractorCard.innerHTML = contentString;
        }

        const linksInCard = regExtractorCard.querySelectorAll('.markdown-text a.internal-link');
        if (linksInCard) {
            linksInCard.forEach(link => {
                link.addEventListener("click", (event:MouseEvent) => {
                    const linkName = link.getAttribute("data-href") || "";
                    const linkedFile = this.plugin.app.metadataCache.getFirstLinkpathDest(linkName, this.plugin.app.workspace.getActiveFile()?.path || "");
                    if (linkedFile instanceof TFile) {
                        this.plugin.app.workspace.getLeaf().openFile(linkedFile);
                    }
                })
            })
        }

        return regExtractorCard;
    }

    extractToFrontBackCard(extract: ParsedExtract): Element | null {

        const regExtractorCard = document.createElement("div");
        regExtractorCard.addClass('regExtractorCard');
        regExtractorCard.setAttribute("isShortened", "false");
        regExtractorCard.setAttribute("cardType", "qa");
        regExtractorCard.setAttribute("cardSide", "front");

        const extractTypeName = ParsedExtract.normalizeString(extract.getName());

        let frontLabelString:string;
        if (extract.checkIfGroupnameExists('FrontLabel')) {
            frontLabelString = ParsedExtract.normalizeString(extract.getMatchByGroupname('FrontLabel'));
        } else {
            frontLabelString = ParsedExtract.normalizeString(extract.getName())
        }

        let backLabelString:string;
        if (extract.checkIfGroupnameExists('BackLabel')) {
            backLabelString = ParsedExtract.normalizeString(extract.getMatchByGroupname('BackLabel'));
        } else {
            backLabelString = ParsedExtract.normalizeString(extract.getName())
        }

        const frontContentString = extract.getMatchByGroupname('FrontContent');
        const backContentString = extract.getMatchByGroupname('BackContent');

        const regExtractorCardLabelArea = regExtractorCard.createEl("div", "regExtractorCardLabelArea");
        regExtractorCardLabelArea.addClass("regExtractorCardLabelArea");
        regExtractorCardLabelArea.textContent = extractTypeName;

        const cardMarkdownText = regExtractorCard.createEl("div", "cardMarkdownText");
        cardMarkdownText.addClass("cardMarkdownText");

        cardMarkdownText.createDiv(("markdown-text"), (el: HTMLElement) => {MarkdownRenderer.render(this.plugin.app, frontContentString, el, this.plugin.app.workspace.getActiveFile()?.path || "", this.plugin)});
        
        // Toggle between front and back
        regExtractorCard.addEventListener("click", (event: MouseEvent) => {
            cardMarkdownText.innerHTML = '';
            const regExtractorCardLabelArea = regExtractorCard.querySelector('.regExtractorCardLabelArea')
            if (regExtractorCard.getAttribute("cardSide") == "front") {
                regExtractorCard.setAttribute("cardSide", "back");
                if (regExtractorCardLabelArea instanceof HTMLElement) {
                    regExtractorCardLabelArea.innerHTML = backLabelString;
                }
                cardMarkdownText.createDiv(("markdown-text"), (el: HTMLElement) => {MarkdownRenderer.render(this.plugin.app, backContentString, el, this.plugin.app.workspace.getActiveFile()?.path || "", this.plugin)});
            } else {
                regExtractorCard.setAttribute("cardSide", "front");   
                if (regExtractorCardLabelArea instanceof HTMLElement) {
                    regExtractorCardLabelArea.innerHTML = frontLabelString;
                }                 
                cardMarkdownText.createDiv(("markdown-text"), (el: HTMLElement) => {MarkdownRenderer.render(this.plugin.app, frontContentString, el, this.plugin.app.workspace.getActiveFile()?.path || "", this.plugin)});
            }
        }); 
        return regExtractorCard;
    }

    toggleShortLong(cardToToggle:HTMLElement, textShort:string, textLong:string) {
        const cardMarkdownText = cardToToggle.querySelectorAll('.cardMarkdownText');
        cardMarkdownText.forEach(element => {
            element.innerHTML = '';
            if (cardToToggle.getAttribute("isShortened") == "true") {
                cardToToggle.setAttribute("isShortened", "false");
                element.createDiv(("markdown-text"), (el: HTMLElement) => {MarkdownRenderer.render(this.plugin.app, textLong, el, this.plugin.app.workspace.getActiveFile()?.path || "", this.plugin)});
            } else {
                cardToToggle.setAttribute("isShortened", "true");                    
                element.createDiv(("markdown-text"), (el: HTMLElement) => {MarkdownRenderer.render(this.plugin.app, textShort, el, this.plugin.app.workspace.getActiveFile()?.path || "", this.plugin)});
            }
        });
    }

    extractToTableLine(extract: ParsedExtract, filter?: string): Element | null {
        if (filter) {
            const filterLowerCase = ParsedExtract.normalizeString(filter);
            if (!getRegexTypeNames().includes(filterLowerCase)) {
                const titleString = ParsedExtract.normalizeString(extract.matches[extract.regExType.titleGroupIndex]);
                if (!titleString.includes(filterLowerCase)) {
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