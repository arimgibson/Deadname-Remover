export type Names = {
  first: NamesKind;
  middle: NamesKind;
  last: NamesKind;
};

export type NamesKind = {
  // as in a kind of name, such as a first or last name
  // i.e. one NamesKind object would have just first names
  [key: string]: string; // format is properName: deadname; i.e. "jack: jackie"
};

export type MessageToTab = {
  status: string;
};

export interface UserSettings {
  names: Names;
  deadnames: Names;
  enabled: boolean;
  stealthMode: boolean;
  highlight: boolean;
  theme: 'trans' | 'non-binary' | 'high-contrast-light' | 'hight-contrast-dark';
}

export const defaultSettings: Settings = {
  names: {
    first: {},
    middle: {},
    last: {},
  },
  deadnames: {
    first: {},
    middle: {},
    last: {},
  },
  enabled: true,
  stealthMode: false,
  highlight: false,
  theme: 'trans',
};
