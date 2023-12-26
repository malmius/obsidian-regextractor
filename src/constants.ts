export const VIEW_TYPES = {
    'DEFAULT_VIEW': 'DEFAULT_VIEW'
}

export enum RENDERTYPE {
  "REGULAR",
  "FRONT_BACK"
}

export class RegexType {
    regEx: string;
    type: string;
    hasTitle: boolean;
    regExGroups: string[];
    titleGroupIndex: number;
    contentGroupIndex: number;
    matchByLine: boolean;
    renderType: RENDERTYPE;

    constructor(regEx: string
      , type: string
      , hasTitle: boolean
      , regExGroups: string[]
      , titleGroupIndex: number
      , contentGroupIndex: number
      , matchByLine: boolean
      , renderType: RENDERTYPE) {
      this.regEx = regEx;
      this.type = type;
      this.hasTitle = hasTitle;
      this.regExGroups = regExGroups;
      this.titleGroupIndex = titleGroupIndex;
      this.contentGroupIndex = contentGroupIndex;
      this.matchByLine = matchByLine;
      this.renderType = renderType;
    }
  }
  
export const REGEX_TYPES = {
    'FIELD_ROUNDBRACKETS': new RegexType(
      '\\((\\w+)::(.*?)\\)',
      'FIELD',
      true,
      ['total', 'fieldname', 'fieldcontent'],
      1, // das zweite Element, d.h. bei Index 1 beinhaltet den Namen des Feldes
      2,
      true,
      RENDERTYPE.REGULAR
    ),
    'FIELD_SQUAREBRACKETS': new RegexType(
        // '\\[(\\w+)::(.*?)\\]',
        '\\[(\\w+)::\\s+((?:\\[{2})?[^\\]]*(?:\\]{2})?)\\]', // berücksichtigt auch Links
        'FIELD',
        true,
        ['total', 'fieldname', 'fieldcontent'],
        1, // das zweite Element, d.h. bei Index 1 beinhaltet den Namen des Feldes
        2,
        true,
        RENDERTYPE.REGULAR
      ),
      'FIELD_NOBRACKETS': new RegexType(
        '^([^(\\[]*)::(.*)',
        'FIELD',
        true,
        ['total', 'fieldname', 'fieldcontent'],
        1, // das zweite Element, d.h. bei Index 1 beinhaltet den Namen des Feldes
        2,
        true,
        RENDERTYPE.REGULAR
      ),
    'HIGHLIGHT': new RegexType(
        '==(.*?)==',
        'HIGHLIGHT',
        false,
        ['total', 'content'],
        -1, // Kein Name
        1,
        true,
        RENDERTYPE.REGULAR
    ),
    'Q&A': new RegexType(
        '^(#Q)[ ]*[:]{0,2}[ ]*((?:.+\n)*)\n*(#A)[ ]*[:]{0,2}[ ]*(.+(?:\n(?:^.{1,3}$|^.{4}(?<!<!--).*))*)',
        'Q&A',
        false,
        ['total', 'FrontLabel', 'FrontContent', 'BackLabel', 'BackContent'],
        1, // Kein Name
        2,
        false,
        RENDERTYPE.FRONT_BACK
    ),
    'MD_COMMENTS': new RegexType(
      '%%(.*?)%%',
      'COMMENT',
      false,
      ['total', 'content'],
      -1, // Kein Name
      1,
      true,
      RENDERTYPE.REGULAR
    ),
    'OBSIDIAN_CALLOUTS': new RegexType(
      '^>\\s+\\[!(.*)\\]\\s?(.*)\n^>\\s+(.*)',
      'CALLOUT',
      false,
      ['total', 'calloutname', 'callouttitle', 'calloutcontent'],
      1,
      3,
      false,
      RENDERTYPE.REGULAR
    ),
    'SYNONYMS': new RegexType(
      '^#Synonym(?:::)?\\s+(.*)\\s(?:=|:::)\\s(.*)',
      'SYNONYM',
      false,
      ['total', 'FrontContent', 'BackContent'],
      -1, // Kein Name
      3,
      true,
      RENDERTYPE.FRONT_BACK
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

