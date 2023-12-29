import { WorkspaceLeaf, ItemView, setIcon, MarkdownRenderer, TFile, Notice, MarkdownView, MarkdownPreviewView } from "obsidian";
import RegexExtractorPlugin from "./main";
import { Parser, ParsedExtract } from "./parser";
import { REGEX_TYPES, REGEXTRACT_RENDER_TYPE, VIEW_TYPES, getRegexTypesWithLabels, getRegexTypeNames, REGEXTRACT_TYPE, getHasLabelsFromDisplayName, getTypeFromDisplayName } from './constants';
import { getArrayFromText } from "./settings";
import { LAYOUT_TYPE, DEFAULT_REGEXTRACT_DROPDOWN } from "./constants";

//import { t } from "./lang/helper"

export class RegexExtractorView extends ItemView {
	private plugin: RegexExtractorPlugin;
	private eventListeners: Array<{ element: HTMLElement; handler: (event: MouseEvent) => void }> = [];
    private currentLayout: LAYOUT_TYPE = LAYOUT_TYPE.CARD;

	constructor(leaf: WorkspaceLeaf, plugin: RegexExtractorPlugin) {
		super(leaf);
		this.plugin = plugin;
        this.icon = 'scroll-text';
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
        this.refreshParsedExtracts();
    }

    reloadRegexExtractorViewDefault() {
        // Set Defaults
        const fieldTypeDropDown = document.getElementById("regextractor-nav-select-regextype");
        if (fieldTypeDropDown instanceof HTMLSelectElement) {
            fieldTypeDropDown.value = DEFAULT_REGEXTRACT_DROPDOWN;
        }

        const fieldsContainer = document.getElementById('regextractor-container-labels');
        const contentContainer = document.getElementById('regextractor-container-extracts');
        if (fieldsContainer) {
            this.drawFields(fieldsContainer, DEFAULT_REGEXTRACT_DROPDOWN); 
        }
        if (contentContainer) {
            this.drawContent(contentContainer, this.currentLayout);
        }

        // Keine ausgewählten Pills
        const fieldElement = document.querySelectorAll('.fieldElement');
        fieldElement.forEach(element => {
            element.removeClass('selectedLabel');
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
        navActionButtonRefresh.id = 'regextractor-nav-action-button-refresh';
		setIcon(navActionButtonRefresh, "refresh-cw");
		const navActionButtonShowAsCard = navigationContainer.createEl("div", "regextractor-nav-action-button");
        navActionButtonShowAsCard.id = 'regextractor-nav-action-button-showascard';
		setIcon(navActionButtonShowAsCard, "panel-top");
        const navActionButtonShowAsTable = navigationContainer.createEl("div", "regextractor-nav-action-button");
        navActionButtonShowAsTable.id = 'regextractor-nav-action-button-showastable';
		setIcon(navActionButtonShowAsTable, "table");
        const navActionButtonCopyElements = navigationContainer.createEl("div", "regextractor-nav-action-button");
        navActionButtonCopyElements.id = 'regextractor-nav-action-button-copy';
		setIcon(navActionButtonCopyElements, "copy");
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

        navActionButtonCopyElements.addEventListener("click", (event: MouseEvent) => {
            const elements = document.querySelectorAll('.regExtractorCard[isfiltered="false"] .cardMarkdownText');
            let elementContents = '';
            elements.forEach(element => {
                elementContents += element.textContent + '\n';
            })
            navigator.clipboard.writeText(elementContents);
            new Notice('extracts copied to clipboard');
        });

        // Field Types
        const regexTypeNames: string[] = getRegexTypeNames();
        const fieldTypeOption = regexTypeSelect.createEl("option");
        fieldTypeOption.value = DEFAULT_REGEXTRACT_DROPDOWN;
        fieldTypeOption.text = DEFAULT_REGEXTRACT_DROPDOWN;
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
            const fieldTypeDropDownValue = fieldTypeDropDown.value;
            const regextractTypeHasLabel = getHasLabelsFromDisplayName(fieldTypeDropDownValue);
            if (regextractTypeHasLabel) {
                fieldsContainer?.setAttribute("ishidden", "false");
                fieldsContainer.style.display = 'block';
                this.drawFields(fieldsContainer, fieldTypeDropDownValue);
            } else {
                fieldsContainer?.setAttribute("ishidden", "true");
                fieldsContainer.style.display = 'none';
            }
            this.filterCardsByType(getTypeFromDisplayName(fieldTypeDropDownValue));
            this.filterCardsByLabel();
        }
    }


    protected filterCardsByType(selectedType:string) {
        const elements = document.querySelectorAll('.regExtractorCard');
        // Array mit allen labels die man ignorieren soll aus den Settings
        const ignoreLabelsArray = getArrayFromText(this.plugin.settings.ignoreFieldsList, ',');
        elements.forEach(function(element) {
            if (element instanceof HTMLElement) {
                if (selectedType === ''
                    && !ignoreLabelsArray.includes(element.getAttribute('labelname'))) // alle selected types, die nicht gültig sind, zeigen alle Elemente an (z.B. 'all')
                {
                    element.setAttribute("isfiltered", "false");
                    element.style.display = 'grid';
                    return;
                }
                if (element.getAttribute('regextype') === selectedType
                    && !ignoreLabelsArray.includes(element.getAttribute('labelname'))) {
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
        // Test, ob es ein container für labels überhaupt gibt
        // if (document.getElementById('regextractor-container-labels')?.getAttribute("ishidden") == "true") {
        //     return;
        // }
        // Array mit allen ausgewählten Labels-Elementen
        const selectedLabelsElements = document.querySelectorAll('.fieldElement.selectedLabel');
        // Array mit allen labelnames Attributen der Label-Elemente
        const selectedFieldNames = Array.from(selectedLabelsElements).map(element => element.getAttribute("labelname"));
        // Alle Card Elemente, die nicht gefiltert sind (durch den Typ)
        const elements = document.querySelectorAll('.regExtractorCard[isfiltered="false"]');
        elements.forEach(function(element) {
            if (element instanceof HTMLElement) {
                if (selectedFieldNames.length == 0 // keine Labels ausgewählt = alle anzeigen
                    || selectedFieldNames.includes(element.getAttribute("labelname"))) {
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

            // Get ignore Fields from Settings
            const ignoreLabelsArray = getArrayFromText(this.plugin.settings.ignoreFieldsList, ',');

            // Filtere nach den Ignore Fields
            for (const key of Object.keys(distinctFieldnames)) {
                const fieldsArrayPerType: string[] = distinctFieldnames[key];
                const filteredArray = fieldsArrayPerType.filter(fieldName => !ignoreLabelsArray.includes(fieldName));
                distinctFieldnames[key] = filteredArray;
            }

            // Create Elements für jedes Field
                for (const key of Object.keys(distinctFieldnames)) {
                    if (key === getTypeFromDisplayName(fieldTypeDropDownValue)) {
                        distinctFieldnames[key].forEach((fieldname: string) => {
                            const fieldPill = this.createLabelElement(fieldname);
                            parentElement.appendChild(fieldPill);
                        })
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

    createLabelElement(labelname: string): Element {
        const fieldElement = createEl("div", "fieldElement");
        fieldElement.setAttribute("labelname", labelname);
        fieldElement.innerHTML = labelname;

        fieldElement.addEventListener('click', () => {
            fieldElement.classList.toggle('selectedLabel');
            this.filterCardsByLabel();
        })

        return fieldElement;
    }


    extractToRegularCard(extract: ParsedExtract): Element | null {
        const regExtractorCard = document.createElement("div");
        regExtractorCard.addClass('regExtractorCard');
        regExtractorCard.setAttribute("cardType", "regular");
        regExtractorCard.setAttribute("isShortened", "false");
        regExtractorCard.setAttribute("labelname", ParsedExtract.normalizeString(extract.getName()));

        const extractTypeName = ParsedExtract.normalizeString(extract.getName());
        const titleString: string | null = extract.getTitle();
        const contentString = extract.matches[extract.regExType.contentGroupIndex];
        const contentIsLong: boolean = contentString.length >= 200;

        const regExtractorCardLabelArea = regExtractorCard.createEl("div", "regExtractorCardLabelArea");
        regExtractorCardLabelArea.addClass("regExtractorCardLabelArea");
        regExtractorCardLabelArea.textContent = extractTypeName;

        const cardMarkdownText = regExtractorCard.createEl("div", "cardMarkdownText");
        cardMarkdownText.addClass("cardMarkdownText");

        const cardMarkdownInfo = regExtractorCard.createEl("div", "regExtractorCardInfoArea");
        cardMarkdownInfo.id = 'regExtractorCardInfoArea'

        if (contentIsLong) {
            const truncatedContentString = contentString.substring(0, 180) + "...";

            regExtractorCard.setAttribute("isShortened", "true");
            
            // Set title if available
            if (titleString) {
                cardMarkdownText.createDiv(("markdown-text-title"), (el: HTMLElement) => {
                    MarkdownRenderer.render(this.plugin.app
                        , titleString
                        , el
                        , this.plugin.app.workspace.getActiveFile()?.path || ""
                        , this.plugin
                        )});
    
            }
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
            // Set title if available
            if (titleString) {
                cardMarkdownText.createDiv(("markdown-text-title"), (el: HTMLElement) => {
                    MarkdownRenderer.render(this.plugin.app
                        , titleString
                        , el
                        , this.plugin.app.workspace.getActiveFile()?.path || ""
                        , this.plugin
                        )});
    
            }
            cardMarkdownText.createDiv(("markdown-text"), (el: HTMLElement) => {
                MarkdownRenderer.render(this.plugin.app
                    , contentString
                    , el
                    , this.plugin.app.workspace.getActiveFile()?.path || ""
                    , this.plugin)});
            cardMarkdownInfo.createDiv(("extract-line"), (el: HTMLElement) => {
                el.textContent = String(extract.lineNumber)
                el.addEventListener("click", (event) => {
                    this.plugin.app.workspace.getLeaf().view.setEphemeralState({line: extract.lineNumber});
                })
            });
            // regExtractorCard.innerHTML = contentString;
        }

        // Event Listener for Clicking on Internal Links
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
        regExtractorCard.setAttribute("labelname", ParsedExtract.normalizeString(extract.getName()));
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