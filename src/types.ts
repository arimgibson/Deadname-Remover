/**
  * @author: WillHayCode
  */

export type Name = {
  first: string;
  middle: string;
  last: string;
};

export type BaseSettings = {
  name: Name;
  deadname: Name[];
  enabled: boolean;
  stealthMode: boolean;
  highlight: boolean;
};

export type UserSettings = BaseSettings & {
  websiteSpecificSettings?: {
    [key: string]: any;
  }
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
  websiteSpecificSettings: {},
};
