/**
  * @author: WillHayCode
  */

export interface Name {
    first: string;
    middle: string;
    last: string;
}

export interface UserSettings {
    name: Name;
    deadname: Name[];
    enabled: boolean;
    stealthMode: boolean;
    highlight: boolean;
    theme: 'trans' | 'non-binary' | 'high-contrast-light' | 'hight-contrast-dark';
}

export const DEFAULT_SETTINGS: UserSettings = {
    name: {
        first: '',
        middle: '',
        last: ''
    },
    deadname: [{
        first: '',
        middle: '',
        last: ''
    }],
    enabled: true,
    stealthMode: false,
    highlight: false,
    theme: 'trans',
};
