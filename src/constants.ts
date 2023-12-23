export const VIEW_TYPES = {
    'DEFAULT_VIEW': 'DEFAULT_VIEW'
}

export class RegexType {
    regEx: string;
    type: string;
    hasTitle: boolean;
    regExGroups: string[];
    titleGroupIndex: number;
    contentGroupIndex: number;

    constructor(regEx: string, type: string, hasTitle: boolean, regExGroups: string[], titleGroupIndex: number, contentGroupIndex: number) {
      this.regEx = regEx;
      this.type = type;
      this.hasTitle = hasTitle;
      this.regExGroups = regExGroups;
      this.titleGroupIndex = titleGroupIndex;
      this.contentGroupIndex = contentGroupIndex;
    }
  }
  
export const REGEX_TYPES = {
    'FIELD_ROUNDBRACKETS': new RegexType(
      '\\((\\w+)::(.*?)\\)',
      'FIELD',
      true,
      ['total', 'fieldname', 'fieldcontent'],
      1, // das zweite Element, d.h. bei Index 1 beinhaltet den Namen des Feldes
      2
    ),
    'FIELD_SQUAREBRACKETS': new RegexType(
        // '\\[(\\w+)::(.*?)\\]',
        '\\[(\\w+)::\\s+((?:\\[{2})?[^\\]]*(?:\\]{2})?)\\]', // berücksichtigt auch Links
        'FIELD',
        true,
        ['total', 'fieldname', 'fieldcontent'],
        1, // das zweite Element, d.h. bei Index 1 beinhaltet den Namen des Feldes
        2
      ),
      'FIELD_NOBRACKETS': new RegexType(
        '^([^(\\[]*)::(.*)',
        'FIELD',
        true,
        ['total', 'fieldname', 'fieldcontent'],
        1, // das zweite Element, d.h. bei Index 1 beinhaltet den Namen des Feldes
        2
      ),
    'HIGHLIGHT': new RegexType(
        '==(.*?)==',
        'HIGHLIGHT',
        false,
        ['total'],
        -1, // Kein Name
        1
    ),
    'Q&A': new RegexType(
        '^(#Q)[ ]*[:]{0,2}[ ]*((?:.+\n)*)\n*(#A)[ ]*[:]{0,2}[ ]*(.+(?:\n(?:^.{1,3}$|^.{4}(?<!<!--).*))*)',
        'Q&A',
        false,
        ['total', 'Q', 'Qcontent', 'A', 'Acontent'],
        1, // Kein Name
        2
    )

    
  };

export function getRegexTypeNames(): string[] {
    /**
     * In this code, Object.keys() returns an array of keys from the REGEX_TYPES object.
     * The map() function converts each key to lowercase using toLowerCase().
     * The new Set() constructor then removes duplicate values.
     * The spread syntax ([...set]) is used to convert the set back to an array.
     */
    return [...new Set(Object.values(REGEX_TYPES).map(regexType => regexType.type.toLowerCase()))];
}

export function getFilterableRegexTypes(): RegexType[] {
    return Object.values(REGEX_TYPES).filter(regexType => regexType.hasTitle == true);
}
