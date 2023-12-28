export const VIEW_TYPES = {
    'DEFAULT_VIEW': 'DEFAULT_VIEW'
}

export const REGEXTRACT_TYPE = {
  FIELD: {name: 'FIELD', displayName: 'dataview fields', hasLabel: true},
  HIGHLIGHT: {name: 'HIGHLIGHT', displayName: 'highlighted text', hasLabel: false},
  QA: {name: 'QA', displayName: 'question & answers', hasLabel: false},
  COMMENT: {name: 'COMMENT', displayName: 'comments', hasLabel: false},
  CALLOUT: {name: 'CALLOUT', displayName: 'callouts', hasLabel: true},
  KEYVALUE: {name: 'KEYVALUE', displayName: 'key value pairs', hasLabel: true},
  TASK: {name: 'TASK', displayName: 'tasks', hasLabel: true},
  QUOTE: {name: 'QUOTE', displayName: 'quotes', hasLabel: false},
}

export enum REGEXTRACT_RENDER_TYPE {
  "REGULAR",
  "FRONT_BACK"
}
export class RegexType {
    regEx: string;
    type: string;
    hasLabels: boolean;
    regExGroups: string[];
    titleGroupIndex: number;
    contentGroupIndex: number;
    matchByLine: boolean;
    renderType: REGEXTRACT_RENDER_TYPE;

    constructor(regEx: string
      , type: string
      , hasLabels: boolean
      , regExGroups: string[]
      , titleGroupIndex: number
      , contentGroupIndex: number
      , matchByLine: boolean
      , renderType: REGEXTRACT_RENDER_TYPE) {
      this.regEx = regEx;
      this.type = type;
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
      ['total', 'label', 'content'],
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
        ['total', 'label', 'content'],
        1, // das zweite Element, d.h. bei Index 1 beinhaltet den Namen des Feldes
        2,
        true,
        REGEXTRACT_RENDER_TYPE.REGULAR
      ),
      'FIELD_NOBRACKETS': new RegexType(
        '^([^(\\[]*)::(.*)',
        REGEXTRACT_TYPE.FIELD.name,
        true,
        ['total', 'label', 'content'],
        1, // das zweite Element, d.h. bei Index 1 beinhaltet den Namen des Feldes
        2,
        true,
        REGEXTRACT_RENDER_TYPE.REGULAR
      ),
    'HIGHLIGHT': new RegexType(
        '==(.*?)==',
        REGEXTRACT_TYPE.HIGHLIGHT.name,
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
      ['total', 'content'],
      -1, // Kein Name
      1,
      true,
      REGEXTRACT_RENDER_TYPE.REGULAR
    ),
    'OBSIDIAN_CALLOUTS': new RegexType(
      '^>\\s+\\[!(.*)\\]\\s?(.*)\n^>\\s+(.*)',
      REGEXTRACT_TYPE.CALLOUT.name,
      true,
      ['total', 'label', 'title', 'content'],
      1,
      3,
      false,
      REGEXTRACT_RENDER_TYPE.REGULAR
    ),
    'SYNONYMS': new RegexType(
      '^#(Synonym)(?:::)?\\s+(.*)\\s(?:=|:::)\\s(.*)',
      REGEXTRACT_TYPE.KEYVALUE.name,
      true,
      ['total', 'label', 'FrontContent', 'BackContent'],
      1, // Kein Name
      3,
      true,
      REGEXTRACT_RENDER_TYPE.FRONT_BACK
    ),
    'MINIMAL_TASKS': new RegexType(
      '^[ \\t]*- \\[(.)\\][ ]*(.*)',
      REGEXTRACT_TYPE.TASK.name,
      true,
      ['total', 'label', 'content'],
      1, 
      2,
      true,
      REGEXTRACT_RENDER_TYPE.REGULAR
    ),
    'LIST_CALLOUTS': new RegexType(
      '^[ \\t]*- ([&?!~@$§%])[ ]*(.*)',
      REGEXTRACT_TYPE.CALLOUT.name,
      true,
      ['total', 'label', 'content'],
      1,
      2,
      true,
      REGEXTRACT_RENDER_TYPE.REGULAR
    ),
    'QUOTES': new RegexType(
      '> (.*)',
      REGEXTRACT_TYPE.QUOTE.name,
      false,
      ['total', 'content'],
      -1,
      1,
      true,
      REGEXTRACT_RENDER_TYPE.REGULAR
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

export function getRegexTypesWithLabels(): RegexType[] {
    return Object.values(REGEX_TYPES).filter(regexType => regexType.hasLabels == true);
}

export function getTypeFromDisplayName(displayName: string): string {
  const objectKeys = Object.keys(REGEXTRACT_TYPE)
  for (let i = 0; i < objectKeys.length; i++) {
    const key = objectKeys[i];
    if (REGEXTRACT_TYPE[key].displayName === displayName) {
      return key;
    }
  }
  return "";
}

export function getHasLabelsFromDisplayName(displayName: string): boolean {
  const displayNameArray =  Object.values(REGEXTRACT_TYPE)
  .filter(type => type.displayName === displayName)
  .map(type => type.hasLabel);
  return Boolean(displayNameArray[0]); // Array hat nur ein Element
}
