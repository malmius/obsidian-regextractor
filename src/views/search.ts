import { text } from "stream/consumers";

export function searchExtracts(searchString:string)  {
    const extractElements = document.querySelectorAll('.regExtractorCard[isfiltered="false"]');
    
    for (let i = 0; i < extractElements.length; i++) {
        const extractElement = extractElements[i];

        if (!(extractElement instanceof HTMLElement)) {
            continue;
        }

        const textContentOfElement = extractElement.textContent;

        if (!textContentOfElement) {
            continue;
        }

        const cleanedTextContentOfElement = textContentOfElement.trim().toLowerCase();
        const cleanedSearchString = searchString.trim().toLowerCase()
        
        if (cleanedTextContentOfElement.includes(cleanedSearchString)) {
            extractElement.setAttribute("isfiltered", "false");
        }
        else {
            extractElement.setAttribute("isfiltered", "true");
        }
    }
}