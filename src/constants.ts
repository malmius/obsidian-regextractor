export const VIEW_TYPES = {
    'DEFAULT_VIEW': 'DEFAULT_VIEW'
}

export class RegexType {
    regEx: string;
    type: string;
    regExGroups: string[];
    titleGroupIndex: number;
    contentGroupIndex: number;

    constructor(regEx: string, type: string, regExGroups: string[], titleGroupIndex: number, contentGroupIndex: number) {
      this.regEx = regEx;
      this.type = type;
      this.regExGroups = regExGroups;
      this.titleGroupIndex = titleGroupIndex;
      this.contentGroupIndex = contentGroupIndex;
    }
  }
  
export const REGEX_TYPES = {
    'FIELD_ROUNDBRACKETS': new RegexType(
      '\\((\\w+)::(.*?)\\)',
      'FIELD',
      ['total', 'fieldname', 'fieldcontent'],
      1, // das zweite Element, d.h. bei Index 1 beinhaltet den Namen des Feldes
      2
    ),
    'FIELD_SQUAREBRACKETS': new RegexType(
        '\\[(\\w+)::(.*?)\\]',
        'FIELD',
        ['total', 'fieldname', 'fieldcontent'],
        1, // das zweite Element, d.h. bei Index 1 beinhaltet den Namen des Feldes
        2
      ),
      'FIELD_NOBRACKETS': new RegexType(
        '^([^(\\[]*)::(.*)',
        'FIELD',
        ['total', 'fieldname', 'fieldcontent'],
        1, // das zweite Element, d.h. bei Index 1 beinhaltet den Namen des Feldes
        2
      ),
    'HIGHLIGHT': new RegexType(
        '==(.*?)==',
        'HIGHLIGHT',
        ['total'],
        -1, // Kein Name
        1
    )
  };

export function getRegexTypeNames(): string[] {
    return Object.keys(REGEX_TYPES).map(key => key.toLowerCase());
}

//   export const REGEX_TYPES = {
//     'FIELD_ROUNDBRACKETS': {
//         regEx: '\\((\\w+)::(.*?)\\)',
//         type: 'FIELD',
//         regExGroups: ['total', 'fieldname', 'fieldcontent'],
//         titleGroupIndex: 1, 
//         contentGroupIndex: 2
//     }
// }