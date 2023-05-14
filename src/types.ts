/**
  * @author: WillHayCode
  */

export type Name = {
  first: string;
  middle: string;
  last: string;
};

export type UserSettings = {
  name: Name;
  deadname: Name[];
  enabled: boolean;
  stealthMode: boolean;
  highlight: boolean;
  ignoreCase: boolean;
};

export const DEFAULT_SETTINGS: UserSettings = {
  name: {
    first: '',
    middle: '',
    last: '',
  },
  deadname: [{
    first: '',
    middle: '',
    last: '',
  }],
  enabled: true,
  stealthMode: false,
  highlight: false,
  ignoreCase: true,
};
