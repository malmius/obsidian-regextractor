export const VIEW_TYPES = {
    'DEFAULT_VIEW': 'DEFAULT_VIEW'
}

export const REGEXTRACT_TYPE = {
  FIELD: {name: 'FIELD', displayName: 'dataview fields', hasLabel: true},
  HIGHLIGHT: {name: 'HIGHLIGHT', displayName: 'highlighted text', hasLabel: false},
  QA: {name: 'Q&A', displayName: 'question & answers', hasLabel: false},
  COMMENT: {name: 'COMMENT', displayName: 'comments', hasLabel: false},
  CALLOUT: {name: 'CALLOUT', displayName: 'callouts', hasLabel: true},
  KEYVALUE: {name: 'KEY&VALUE', displayName: 'key value pairs', hasLabel: true}
}

export enum REGEXTRACT_RENDER_TYPE {
  "REGULAR",
  "FRONT_BACK"
}
export class RegexType {
    regEx: string;
    type: string;
    hasTitle: boolean;
    hasLabels: boolean;
    regExGroups: string[];
    titleGroupIndex: number;
    contentGroupIndex: number;
    matchByLine: boolean;
    renderType: REGEXTRACT_RENDER_TYPE;

    constructor(regEx: string
      , type: string
      , hasTitle: boolean
      , hasLabels: boolean
      , regExGroups: string[]
      , titleGroupIndex: number
      , contentGroupIndex: number
      , matchByLine: boolean
      , renderType: REGEXTRACT_RENDER_TYPE) {
      this.regEx = regEx;
      this.type = type;
      this.hasTitle = hasTitle;
      this.hasLabels = hasLabels;
      this.regExGroups = regExGroups;
      this.titleGroupIndex = titleGroupIndex;
      this.contentGroupIndex = contentGroupIndex;
      this.matchByLine = matchByLine;
      this.renderType = renderType;
    }

    hasLabel() {
      return this.hasLabel;
    }
  }
  
export const REGEX_TYPES = {
    'FIELD_ROUNDBRACKETS': new RegexType(
      '\\((\\w+)::(.*?)\\)',
      REGEXTRACT_TYPE.FIELD.name,
      true,
      true,
      ['total', 'fieldname', 'fieldcontent'],
      1, // das zweite Element, d.h. bei Index 1 beinhaltet den Namen des Feldes
      2,
      true,
      REGEXTRACT_RENDER_TYPE.REGULAR
    ),
    'FIELD_SQUAREBRACKETS': new RegexType(
        // '\\[(\\w+)::(.*?)\\]',
        '\\[(\\w+)::\\s+((?:\\[{2})?[^\\]]*(?:\\]{2})?)\\]', // berücksichtigt auch Links
        REGEXTRACT_TYPE.FIELD.name,
        true,
        true,
        ['total', 'fieldname', 'fieldcontent'],
        1, // das zweite Element, d.h. bei Index 1 beinhaltet den Namen des Feldes
        2,
        true,
        REGEXTRACT_RENDER_TYPE.REGULAR
      ),
      'FIELD_NOBRACKETS': new RegexType(
        '^([^(\\[]*)::(.*)',
        REGEXTRACT_TYPE.FIELD.name,
        true,
        true,
        ['total', 'fieldname', 'fieldcontent'],
        1, // das zweite Element, d.h. bei Index 1 beinhaltet den Namen des Feldes
        2,
        true,
        REGEXTRACT_RENDER_TYPE.REGULAR
      ),
    'HIGHLIGHT': new RegexType(
        '==(.*?)==',
        REGEXTRACT_TYPE.HIGHLIGHT.name,
        false,
        false,
        ['total', 'content'],
        -1, // Kein Name
        1,
        true,
        REGEXTRACT_RENDER_TYPE.REGULAR
    ),
    'Q&A': new RegexType(
        '^(#Q)[ ]*[:]{0,2}[ ]*((?:.+\n)*)\n*(#A)[ ]*[:]{0,2}[ ]*(.+(?:\n(?:^.{1,3}$|^.{4}(?<!<!--).*))*)',
        REGEXTRACT_TYPE.QA.name,
        false,
        false,
        ['total', 'FrontLabel', 'FrontContent', 'BackLabel', 'BackContent'],
        1, // Kein Name
        2,
        false,
        REGEXTRACT_RENDER_TYPE.FRONT_BACK
    ),
    'MD_COMMENTS': new RegexType(
      '%%(.*?)%%',
      REGEXTRACT_TYPE.COMMENT.name,
      false,
      false,
      ['total', 'content'],
      -1, // Kein Name
      1,
      true,
      REGEXTRACT_RENDER_TYPE.REGULAR
    ),
    'OBSIDIAN_CALLOUTS': new RegexType(
      '^>\\s+\\[!(.*)\\]\\s?(.*)\n^>\\s+(.*)',
      REGEXTRACT_TYPE.CALLOUT.name,
      false,
      true,
      ['total', 'calloutname', 'callouttitle', 'calloutcontent'],
      1,
      3,
      false,
      REGEXTRACT_RENDER_TYPE.REGULAR
    ),
    'SYNONYMS': new RegexType(
      '^#(Synonym)(?:::)?\\s+(.*)\\s(?:=|:::)\\s(.*)',
      REGEXTRACT_TYPE.KEYVALUE.name,
      false,
      false,
      ['total', 'Label', 'FrontContent', 'BackContent'],
      1, // Kein Name
      3,
      true,
      REGEXTRACT_RENDER_TYPE.FRONT_BACK
    )
  };

export function getRegexTypeNames(): string[] {
    /**
     * In this code, Object.keys() returns an array of keys from the REGEX_TYPES object.
     * The map() function converts each key to lowercase using toLowerCase().
     * The new Set() constructor then removes duplicate values.
     * The spread syntax ([...set]) is used to convert the set back to an array.
     */
    // return [...new Set(Object.values(REGEX_TYPES).map(regexType => regexType.type.toLowerCase()))];
    return [...new Set(Object.values(REGEXTRACT_TYPE).map(regextractType => regextractType.displayName))];
}

export function getFilterableRegexTypes(): RegexType[] {
    return Object.values(REGEX_TYPES).filter(regexType => regexType.hasTitle == true);
}


